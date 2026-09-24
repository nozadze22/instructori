import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { toAuthRole, type AuthUser } from '../auth/dto/auth-types';
import {
  CreateRouteDto,
  CreateRouteStepDto,
  CreateStepDto,
  NavigationTickDto,
  ReorderStepsDto,
  RoutePathPointDto,
  RouteVisibilityDto,
  UpdateRouteDto,
  UpdateStepDto,
} from './dto/route.dto';
import { ExamRegionsService } from './exam-regions.service';
import {
  getExamCatalogWithSources,
  loadSaRouteSources,
} from './exam-route-sync';
import {
  distanceToPolylineMeters,
  findUpcomingStep,
  type PathPoint,
} from './navigation-geometry';
import { RedisService } from '../../redis/redis.service';

const routeInclude = {
  steps: {
    orderBy: { order: 'asc' as const },
  },
  createdBy: {
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
    },
  },
};

function toPathJson(path?: RoutePathPointDto[]): Prisma.InputJsonValue {
  if (!path?.length) return [];
  return path.map((point) => [point.lng, point.lat]);
}

function mapStepCreate(step: CreateRouteStepDto | CreateStepDto, index: number) {
  return {
    lat: step.lat,
    lng: step.lng,
    action: step.action,
    distanceBeforeVoice: step.distanceBeforeVoice ?? 0,
    voiceText: step.voiceText,
    audioUrl: step.audioUrl,
    order: step.order ?? index,
  };
}

const DEFAULT_ON_ROUTE_THRESHOLD_METERS = 20;
const DEFAULT_MOVING_SPEED_THRESHOLD_KMH = 3;
/** Public catalog/detail cache TTL (Upstash). */
const PUBLIC_ROUTES_CACHE_TTL_SEC = 120;

@Injectable()
export class RoutesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly examRegionsService: ExamRegionsService,
    private readonly redis: RedisService,
  ) {}

  findCities() {
    return this.examRegionsService.getActiveExamCities();
  }

  async findPublicCatalog(
    query: {
      q?: string;
      city?: string;
      page?: number;
      pageSize?: number;
    } = {},
    userId?: string,
  ) {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(48, Math.max(1, Number(query.pageSize) || 15));
    const skip = (page - 1) * pageSize;
    const search = query.q?.trim();
    const city = query.city?.trim();

    type CatalogPayload = {
      items: Array<Record<string, unknown> & { id: string; isSaved?: boolean }>;
      total: number;
      page: number;
      pageSize: number;
      cities: string[];
    };

    const cacheKey = await this.redis.catalogKey({
      q: search,
      city,
      page,
      pageSize,
    });
    const cached = await this.redis.getJson<CatalogPayload>(cacheKey);

    let payload: CatalogPayload;
    if (cached) {
      payload = cached;
    } else {
      payload = await this.buildPublicCatalog({
        search,
        city,
        page,
        pageSize,
        skip,
      });
      await this.redis.setJson(cacheKey, payload, PUBLIC_ROUTES_CACHE_TTL_SEC);
    }

    if (!userId || !payload.items.length) {
      return payload;
    }

    const withSaved = await this.withSavedFlags(userId, payload.items);
    return { ...payload, items: withSaved };
  }

  private async buildPublicCatalog(options: {
    search?: string;
    city?: string;
    page: number;
    pageSize: number;
    skip: number;
  }) {
    const { search, city, page, pageSize, skip } = options;

    const baseWhere: Prisma.RouteWhereInput = {
      visibility: 'SYSTEM',
      isPublished: true,
      ...(city ? { city } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
              { city: { contains: search, mode: 'insensitive' } },
              {
                createdBy: {
                  fullName: { contains: search, mode: 'insensitive' },
                },
              },
            ],
          }
        : {}),
    };

    const compareKa = (a: string, b: string) =>
      a.localeCompare(b, 'ka', { sensitivity: 'base', numeric: true });

    const [indexRows, cityRows] = await Promise.all([
      this.prisma.route.findMany({
        where: baseWhere,
        select: {
          id: true,
          title: true,
          city: true,
          sourceKey: true,
        },
        orderBy: [{ city: 'asc' }, { title: 'asc' }],
      }),
      this.prisma.route.findMany({
        where: { visibility: 'SYSTEM', isPublished: true },
        select: { city: true, sourceKey: true },
      }),
    ]);

    const visibleIndex = await this.examRegionsService.filterPublicRoutes(
      indexRows,
    );
    const visibleCities = await this.examRegionsService.filterPublicRoutes(
      cityRows,
    );

    const cities = [
      ...new Set(
        visibleCities
          .map((route) => route.city?.trim())
          .filter((value): value is string => Boolean(value)),
      ),
    ].sort(compareKa);

    const sortedIndex = [...visibleIndex].sort((left, right) => {
      const cityCompare = compareKa(left.city ?? '\uFFFF', right.city ?? '\uFFFF');
      if (cityCompare !== 0) return cityCompare;
      return compareKa(left.title, right.title);
    });

    const total = sortedIndex.length;
    const pageIds = sortedIndex.slice(skip, skip + pageSize).map((row) => row.id);

    if (pageIds.length === 0) {
      return { items: [], total, page, pageSize, cities };
    }

    const pageRoutes = await this.prisma.route.findMany({
      where: { id: { in: pageIds } },
      select: {
        id: true,
        title: true,
        description: true,
        city: true,
        sourceKey: true,
        sourceUrl: true,
        visibility: true,
        isPublished: true,
        createdById: true,
        createdAt: true,
        updatedAt: true,
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
        _count: { select: { steps: true } },
      },
    });

    const byId = new Map(pageRoutes.map((route) => [route.id, route]));
    const orderedPage = pageIds
      .map((id) => byId.get(id))
      .filter((route): route is (typeof pageRoutes)[number] => Boolean(route));

    return {
      items: orderedPage.map((route) => {
        const { _count, createdBy, ...rest } = route;
        return {
          ...rest,
          path: [],
          steps: [],
          stepsCount: _count.steps,
          isSaved: false,
          createdBy: {
            ...createdBy,
            email: '',
          },
        };
      }),
      total,
      page,
      pageSize,
      cities,
    };
  }

  async findPublicRoute(routeId: string, userId?: string) {
    const cacheKey = await this.redis.detailKey(routeId);
    type DetailPayload = Record<string, unknown> & {
      id: string;
      createdBy: { email?: string; [key: string]: unknown };
      isSaved?: boolean;
    };

    let payload = await this.redis.getJson<DetailPayload>(cacheKey);
    if (!payload) {
      const route = await this.prisma.route.findUnique({
        where: { id: routeId },
        include: routeInclude,
      });

      if (!route || route.visibility !== 'SYSTEM' || !route.isPublished) {
        throw new NotFoundException('Route not found');
      }

      const isVisible =
        await this.examRegionsService.isRoutePubliclyVisible(route);
      if (!isVisible) {
        throw new NotFoundException('Route not found');
      }

      payload = {
        ...route,
        isSaved: false,
        createdBy: {
          ...route.createdBy,
          email: '',
        },
      };
      await this.redis.setJson(cacheKey, payload, PUBLIC_ROUTES_CACHE_TTL_SEC);
    }

    if (!userId) return payload;

    const [withSaved] = await this.withSavedFlags(userId, [payload]);
    return withSaved;
  }

  /**
   * Upserts official exam route catalog into SYSTEM routes.
   * Path/commands stay empty until digitized from SA PDF maps.
   */
  async syncExamCatalog(user: AuthUser) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can sync exam routes');
    }

    const catalog = getExamCatalogWithSources();
    let created = 0;
    let updated = 0;

    for (const item of catalog) {
      const existing = await this.prisma.route.findUnique({
        where: { sourceKey: item.key },
        select: { id: true },
      });

      if (existing) {
        await this.prisma.route.update({
          where: { id: existing.id },
          data: {
            title: item.title,
            city: item.cityName,
            description: item.description,
            sourceUrl: item.sourceUrl,
            visibility: 'SYSTEM',
            isPublished: true,
          },
        });
        updated += 1;
        continue;
      }

      await this.prisma.route.create({
        data: {
          title: item.title,
          city: item.cityName,
          description: item.description,
          sourceKey: item.key,
          sourceUrl: item.sourceUrl,
          path: [],
          visibility: 'SYSTEM',
          isPublished: true,
          createdById: user.userId,
        },
      });
      created += 1;
    }

    await this.redis.invalidatePublicRoutes();
    return {
      ok: true,
      total: catalog.length,
      created,
      updated,
      scrapedSources: loadSaRouteSources().items.length,
    };
  }

  async create(user: AuthUser, dto: CreateRouteDto) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can create routes');
    }

    const visibility = this.resolveVisibility(user, dto.visibility);

    const created = await this.prisma.route.create({
      data: {
        title: dto.title,
        description: dto.description,
        city: dto.city,
        path: toPathJson(dto.path),
        visibility,
        isPublished: dto.isPublished ?? true,
        createdById: user.userId,
        steps: dto.steps?.length
          ? {
              create: dto.steps.map((step, index) => mapStepCreate(step, index)),
            }
          : undefined,
      },
      include: routeInclude,
    });
    await this.redis.invalidatePublicRoutes();
    return created;
  }

  async findAll(
    user: AuthUser,
    query: {
      q?: string;
      filter?: 'all' | 'mine' | 'system' | 'saved';
      page?: number;
      pageSize?: number;
    } = {},
  ) {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(48, Math.max(1, Number(query.pageSize) || 12));
    const skip = (page - 1) * pageSize;
    const search = query.q?.trim().toLowerCase();
    const filter = query.filter ?? 'all';
    const role = await this.resolveUserRole(user);
    const isAdmin = role === 'ADMIN';

    const routes = isAdmin
      ? await this.prisma.route.findMany({
          orderBy: { updatedAt: 'desc' },
          include: routeInclude,
        })
      : await this.prisma.route.findMany({
          where: {
            OR: [
              { createdById: user.userId },
              { visibility: 'SYSTEM', isPublished: true },
            ],
          },
          orderBy: { updatedAt: 'desc' },
          include: routeInclude,
        });

    const visibleRoutes = isAdmin
      ? routes
      : await this.filterSystemRoutesForNonAdmin(routes, user.userId);

    const withSaved = await this.withSavedFlags(user.userId, visibleRoutes);

    const counts = {
      all: withSaved.length,
      mine: withSaved.filter((route) => route.createdById === user.userId)
        .length,
      system: withSaved.filter((route) => route.visibility === 'SYSTEM').length,
      saved: withSaved.filter((route) => route.isSaved).length,
    };

    const matchesSearch = (route: (typeof withSaved)[number]) => {
      if (!search) return true;
      return (
        route.title.toLowerCase().includes(search) ||
        route.city?.toLowerCase().includes(search) ||
        route.description?.toLowerCase().includes(search)
      );
    };

    let filtered = withSaved;
    switch (filter) {
      case 'mine':
        filtered = withSaved.filter((route) => route.createdById === user.userId);
        break;
      case 'system':
        filtered = withSaved.filter((route) => route.visibility === 'SYSTEM');
        break;
      case 'saved':
        filtered = withSaved.filter((route) => route.isSaved);
        break;
      default:
        break;
    }

    if (search) {
      filtered = filtered.filter(matchesSearch);
    }

    const total = filtered.length;
    const items = filtered.slice(skip, skip + pageSize);

    return {
      items,
      total,
      page,
      pageSize,
      counts,
    };
  }

  async findSaved(user: AuthUser) {
    const saved = await this.prisma.savedRoute.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        route: { include: routeInclude },
      },
    });

    const visible: Array<(typeof saved)[number]['route'] & { isSaved: true }> =
      [];

    for (const item of saved) {
      try {
        await this.assertCanView(user, item.route);
        visible.push({ ...item.route, isSaved: true });
      } catch {
        // skip routes the user can no longer access
      }
    }

    return visible;
  }

  async findOne(user: AuthUser, routeId: string) {
    const route = await this.prisma.route.findUnique({
      where: { id: routeId },
      include: routeInclude,
    });
    if (!route) throw new NotFoundException('Route not found');

    await this.assertCanView(user, route);
    const [withFlag] = await this.withSavedFlags(user.userId, [route]);
    return withFlag;
  }

  async save(user: AuthUser, routeId: string) {
    const route = await this.requireRoute(routeId);
    await this.assertCanView(user, route);

    if (route.createdById === user.userId) {
      throw new BadRequestException('You already own this route');
    }

    if (route.visibility !== 'SYSTEM' || !route.isPublished) {
      throw new BadRequestException('Only published SYSTEM routes can be saved');
    }

    await this.prisma.savedRoute.upsert({
      where: {
        userId_routeId: {
          userId: user.userId,
          routeId,
        },
      },
      create: {
        userId: user.userId,
        routeId,
      },
      update: {},
    });

    return this.findOne(user, routeId);
  }

  async unsave(user: AuthUser, routeId: string) {
    await this.prisma.savedRoute.deleteMany({
      where: {
        userId: user.userId,
        routeId,
      },
    });

    return { ok: true };
  }

  async update(user: AuthUser, routeId: string, dto: UpdateRouteDto) {
    const route = await this.requireRoute(routeId);
    this.assertCanManage(user, route);

    if (dto.visibility !== undefined) {
      this.resolveVisibility(user, dto.visibility);
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      if (dto.steps) {
        await tx.routeStep.deleteMany({ where: { routeId } });
        if (dto.steps.length) {
          await tx.routeStep.createMany({
            data: dto.steps.map((step, index) => ({
              routeId,
              ...mapStepCreate(step, index),
            })),
          });
        }
      }

      return tx.route.update({
        where: { id: routeId },
        data: {
          title: dto.title,
          description: dto.description,
          city: dto.city,
          visibility: dto.visibility,
          isPublished: dto.isPublished,
          ...(dto.path !== undefined ? { path: toPathJson(dto.path) } : {}),
        },
        include: routeInclude,
      });
    });
    await this.redis.invalidatePublicRoutes();
    return updated;
  }

  async remove(user: AuthUser, routeId: string) {
    const route = await this.requireRoute(routeId);
    this.assertCanManage(user, route);

    await this.prisma.route.delete({ where: { id: routeId } });
    await this.redis.invalidatePublicRoutes();
    return { ok: true };
  }

  async addStep(user: AuthUser, routeId: string, dto: CreateStepDto) {
    const route = await this.requireRoute(routeId);
    this.assertCanManage(user, route);

    const order =
      dto.order ??
      ((
        await this.prisma.routeStep.aggregate({
          where: { routeId },
          _max: { order: true },
        })
      )._max.order ?? -1) + 1;

    const step = await this.prisma.routeStep.create({
      data: {
        routeId,
        ...mapStepCreate(dto, order),
        order,
      },
    });
    await this.redis.invalidatePublicRoutes();
    return step;
  }

  async updateStep(
    user: AuthUser,
    routeId: string,
    stepId: string,
    dto: UpdateStepDto,
  ) {
    const route = await this.requireRoute(routeId);
    this.assertCanManage(user, route);

    const step = await this.prisma.routeStep.findFirst({
      where: { id: stepId, routeId },
    });
    if (!step) throw new NotFoundException('Step not found');

    const updated = await this.prisma.routeStep.update({
      where: { id: stepId },
      data: {
        lat: dto.lat,
        lng: dto.lng,
        action: dto.action,
        distanceBeforeVoice: dto.distanceBeforeVoice,
        voiceText: dto.voiceText,
        audioUrl: dto.audioUrl,
        order: dto.order,
      },
    });
    await this.redis.invalidatePublicRoutes();
    return updated;
  }

  async removeStep(user: AuthUser, routeId: string, stepId: string) {
    const route = await this.requireRoute(routeId);
    this.assertCanManage(user, route);

    const step = await this.prisma.routeStep.findFirst({
      where: { id: stepId, routeId },
    });
    if (!step) throw new NotFoundException('Step not found');

    await this.prisma.routeStep.delete({ where: { id: stepId } });
    await this.redis.invalidatePublicRoutes();
    return { ok: true };
  }

  async reorderSteps(user: AuthUser, routeId: string, dto: ReorderStepsDto) {
    const route = await this.requireRoute(routeId);
    this.assertCanManage(user, route);

    const existing = await this.prisma.routeStep.findMany({
      where: { routeId },
      select: { id: true },
    });
    const existingIds = new Set(existing.map((s) => s.id));

    if (
      dto.stepIds.length !== existingIds.size ||
      dto.stepIds.some((id) => !existingIds.has(id))
    ) {
      throw new BadRequestException(
        'stepIds must include every step of this route exactly once',
      );
    }

    await this.prisma.$transaction(
      dto.stepIds.map((id, order) =>
        this.prisma.routeStep.update({
          where: { id },
          data: { order },
        }),
      ),
    );

    await this.redis.invalidatePublicRoutes();
    return this.findOne(user, routeId);
  }

  async evaluateNavigationTick(
    user: AuthUser,
    routeId: string,
    dto: NavigationTickDto,
  ) {
    const route = await this.prisma.route.findUnique({
      where: { id: routeId },
      include: {
        steps: { orderBy: { order: 'asc' } },
      },
    });
    if (!route) throw new NotFoundException('Route not found');

    await this.assertCanView(user, route);

    const path = this.extractPathPoints(route.path);
    if (!path.length) {
      throw new BadRequestException('Route has no geometry path');
    }

    const currentPoint = { lat: dto.lat, lng: dto.lng };
    const distanceToRouteMeters = distanceToPolylineMeters(currentPoint, path);
    const onRouteThresholdMeters =
      dto.onRouteThresholdMeters ?? DEFAULT_ON_ROUTE_THRESHOLD_METERS;
    const movingSpeedThresholdKmh =
      dto.movingSpeedThresholdKmh ?? DEFAULT_MOVING_SPEED_THRESHOLD_KMH;

    const isMoving = dto.speedKmh >= movingSpeedThresholdKmh;
    const isOnRoute = distanceToRouteMeters <= onRouteThresholdMeters;

    if (!isMoving) {
      return {
        status: 'NO_ACTION',
        reason: 'NOT_MOVING',
        isMoving,
        isOnRoute,
        speedKmh: dto.speedKmh,
        distanceToRouteMeters: Number(distanceToRouteMeters.toFixed(2)),
        followCamera: false,
        speak: false,
        addPin: false,
        nextInstruction: null,
      };
    }

    if (!isOnRoute) {
      return {
        status: 'NO_ACTION',
        reason: 'OFF_ROUTE',
        isMoving,
        isOnRoute,
        speedKmh: dto.speedKmh,
        distanceToRouteMeters: Number(distanceToRouteMeters.toFixed(2)),
        followCamera: false,
        speak: false,
        addPin: false,
        nextInstruction: null,
      };
    }

    const floorMeters = dto.distanceAlongMeters ?? 0;
    const upcoming = findUpcomingStep(currentPoint, path, route.steps, {
      floorMeters,
      onRouteThresholdMeters: onRouteThresholdMeters,
    });
    const nextStep =
      upcoming?.inVoiceRange === true ? upcoming.step : null;

    return {
      status: 'ACTIVE',
      reason: null,
      isMoving,
      isOnRoute,
      speedKmh: dto.speedKmh,
      distanceToRouteMeters: Number(distanceToRouteMeters.toFixed(2)),
      followCamera: true,
      speak: Boolean(nextStep),
      addPin: false,
      nextInstruction: nextStep
        ? {
            stepId: nextStep.id,
            action: nextStep.action,
            voiceText: nextStep.voiceText ?? null,
          }
        : null,
    };
  }

  private async requireRoute(routeId: string) {
    const route = await this.prisma.route.findUnique({
      where: { id: routeId },
    });
    if (!route) throw new NotFoundException('Route not found');
    return route;
  }

  private extractPathPoints(path: Prisma.JsonValue): PathPoint[] {
    if (!Array.isArray(path)) return [];

    const points: PathPoint[] = [];
    for (const item of path) {
      if (!Array.isArray(item) || item.length < 2) continue;
      const lng = Number(item[0]);
      const lat = Number(item[1]);
      if (Number.isNaN(lat) || Number.isNaN(lng)) continue;

      points.push({ lat, lng });
    }

    return points;
  }

  private async resolveUserRole(user: AuthUser): Promise<AuthUser['role']> {
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.userId },
      select: { role: true },
    });
    return toAuthRole(dbUser?.role ?? user.role);
  }

  private async withSavedFlags<T extends { id: string }>(
    userId: string,
    routes: T[],
  ): Promise<Array<T & { isSaved: boolean }>> {
    if (!routes.length) return [];

    const saved = await this.prisma.savedRoute.findMany({
      where: {
        userId,
        routeId: { in: routes.map((route) => route.id) },
      },
      select: { routeId: true },
    });
    const savedIds = new Set(saved.map((item) => item.routeId));

    return routes.map((route) => ({
      ...route,
      isSaved: savedIds.has(route.id),
    }));
  }

  private resolveVisibility(
    user: AuthUser,
    requested?: RouteVisibilityDto,
  ): RouteVisibilityDto {
    if (user.role === 'ADMIN') {
      return requested ?? RouteVisibilityDto.SYSTEM;
    }

    if (requested === RouteVisibilityDto.SYSTEM) {
      throw new ForbiddenException(
        'Only admins can create or set SYSTEM routes',
      );
    }

    return RouteVisibilityDto.PRIVATE;
  }

  private async filterSystemRoutesForNonAdmin<
    T extends {
      id: string;
      visibility: string;
      city: string | null;
      sourceKey: string | null;
      createdById: string;
    },
  >(routes: T[], userId: string) {
    const catalogRoutes = routes.filter(
      (route) => route.visibility === 'SYSTEM' && route.createdById !== userId,
    );
    const visibleCatalogRoutes =
      await this.examRegionsService.filterPublicRoutes(catalogRoutes);
    const visibleCatalogIds = new Set(
      visibleCatalogRoutes.map((route) => route.id),
    );

    return routes.filter((route) => {
      if (route.visibility !== 'SYSTEM' || route.createdById === userId) {
        return true;
      }
      return visibleCatalogIds.has(route.id);
    });
  }

  private async assertCanView(
    user: AuthUser,
    route: {
      createdById: string;
      visibility: string;
      isPublished: boolean;
      city?: string | null;
      sourceKey?: string | null;
    },
  ) {
    if (user.role === 'ADMIN') return;
    if (route.createdById === user.userId) return;
    if (route.visibility === 'SYSTEM' && route.isPublished) {
      const visible = await this.examRegionsService.isRoutePubliclyVisible(route);
      if (visible) return;
    }

    throw new ForbiddenException('You cannot view this route');
  }

  private assertCanManage(
    user: AuthUser,
    route: { createdById: string; visibility: string },
  ) {
    if (user.role === 'ADMIN') return;
    if (route.createdById === user.userId) return;

    throw new ForbiddenException('You cannot modify this route');
  }
}
