import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { AuthUser } from '../auth/dto/auth-types';
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
import { EXAM_CITIES } from './exam-cities';
import {
  getExamCatalogWithSources,
  loadSaRouteSources,
} from './exam-route-sync';
import {
  distanceToPolylineMeters,
  findUpcomingStep,
  type PathPoint,
} from './navigation-geometry';

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

@Injectable()
export class RoutesService {
  constructor(private readonly prisma: PrismaService) {}

  findCities() {
    return EXAM_CITIES;
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
    const pageSize = Math.min(48, Math.max(1, Number(query.pageSize) || 12));
    const skip = (page - 1) * pageSize;
    const search = query.q?.trim();
    const city = query.city?.trim();

    const where: Prisma.RouteWhereInput = {
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

    const [matchedRoutes, cityRows] = await Promise.all([
      this.prisma.route.findMany({
        where,
        include: routeInclude,
      }),
      this.prisma.route.findMany({
        where: {
          visibility: 'SYSTEM',
          isPublished: true,
          city: { not: null },
        },
        select: { city: true },
        distinct: ['city'],
      }),
    ]);

    const compareKa = (a: string, b: string) =>
      a.localeCompare(b, 'ka', { sensitivity: 'base', numeric: true });

    const sortedRoutes = [...matchedRoutes].sort((left, right) => {
      const cityCompare = compareKa(left.city ?? '\uFFFF', right.city ?? '\uFFFF');
      if (cityCompare !== 0) return cityCompare;
      return compareKa(left.title, right.title);
    });

    const total = sortedRoutes.length;
    const pageItems = sortedRoutes.slice(skip, skip + pageSize);
    const itemsWithSaved = userId
      ? await this.withSavedFlags(userId, pageItems)
      : pageItems.map((route) => ({
          ...route,
          isSaved: false,
          createdBy: {
            ...route.createdBy,
            email: '',
          },
        }));

    return {
      items: itemsWithSaved.map((route) => ({
        ...route,
        createdBy: {
          ...route.createdBy,
          email: '',
        },
      })),
      total,
      page,
      pageSize,
      cities: cityRows
        .map((row) => row.city)
        .filter((value): value is string => Boolean(value))
        .sort(compareKa),
    };
  }

  async findPublicRoute(routeId: string, userId?: string) {
    const route = await this.prisma.route.findUnique({
      where: { id: routeId },
      include: routeInclude,
    });

    if (!route || route.visibility !== 'SYSTEM' || !route.isPublished) {
      throw new NotFoundException('Route not found');
    }

    const [withSaved] = userId
      ? await this.withSavedFlags(userId, [route])
      : [{ ...route, isSaved: false }];

    return {
      ...withSaved,
      createdBy: {
        ...withSaved.createdBy,
        email: '',
      },
    };
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

    return this.prisma.route.create({
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
  }

  async findAll(user: AuthUser) {
    const routes =
      user.role === 'ADMIN'
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

    return this.withSavedFlags(user.userId, routes);
  }

  async findSaved(user: AuthUser) {
    const saved = await this.prisma.savedRoute.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        route: { include: routeInclude },
      },
    });

    return saved
      .filter((item) => {
        try {
          this.assertCanView(user, item.route);
          return true;
        } catch {
          return false;
        }
      })
      .map((item) => ({ ...item.route, isSaved: true }));
  }

  async findOne(user: AuthUser, routeId: string) {
    const route = await this.prisma.route.findUnique({
      where: { id: routeId },
      include: routeInclude,
    });
    if (!route) throw new NotFoundException('Route not found');

    this.assertCanView(user, route);
    const [withFlag] = await this.withSavedFlags(user.userId, [route]);
    return withFlag;
  }

  async save(user: AuthUser, routeId: string) {
    const route = await this.requireRoute(routeId);
    this.assertCanView(user, route);

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

    return this.prisma.$transaction(async (tx) => {
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
  }

  async remove(user: AuthUser, routeId: string) {
    const route = await this.requireRoute(routeId);
    this.assertCanManage(user, route);

    await this.prisma.route.delete({ where: { id: routeId } });
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

    return this.prisma.routeStep.create({
      data: {
        routeId,
        ...mapStepCreate(dto, order),
        order,
      },
    });
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

    return this.prisma.routeStep.update({
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
  }

  async removeStep(user: AuthUser, routeId: string, stepId: string) {
    const route = await this.requireRoute(routeId);
    this.assertCanManage(user, route);

    const step = await this.prisma.routeStep.findFirst({
      where: { id: stepId, routeId },
    });
    if (!step) throw new NotFoundException('Step not found');

    await this.prisma.routeStep.delete({ where: { id: stepId } });
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

    this.assertCanView(user, route);

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

    const upcoming = findUpcomingStep(currentPoint, path, route.steps);
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

  private assertCanView(
    user: AuthUser,
    route: {
      createdById: string;
      visibility: string;
      isPublished: boolean;
    },
  ) {
    if (user.role === 'ADMIN') return;
    if (route.createdById === user.userId) return;
    if (route.visibility === 'SYSTEM' && route.isPublished) return;

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
