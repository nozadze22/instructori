import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import type { ExamRegion } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { DEFAULT_EXAM_REGIONS } from './exam-regions.defaults';

type RouteRegionFields = {
  city?: string | null;
  sourceKey?: string | null;
};

@Injectable()
export class ExamRegionsService implements OnModuleInit {
  private readonly logger = new Logger(ExamRegionsService.name);
  private regionsCache: ExamRegion[] | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  onModuleInit() {
    void this.ensureDefaults().catch((error: unknown) => {
      this.logger.error(
        `Exam region defaults failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    });
  }

  private invalidateCache() {
    this.regionsCache = null;
  }

  private async loadRegions(): Promise<ExamRegion[]> {
    if (this.regionsCache) return this.regionsCache;
    this.regionsCache = await this.prisma.examRegion.findMany({
      orderBy: { name: 'asc' },
    });
    return this.regionsCache;
  }

  async ensureDefaults() {
    for (const def of DEFAULT_EXAM_REGIONS) {
      await this.prisma.examRegion.upsert({
        where: { id: def.id },
        create: {
          id: def.id,
          name: def.name,
          lat: def.lat,
          lng: def.lng,
          keywords: def.keywords,
          isActive: def.isActive,
        },
        update: {
          name: def.name,
          lat: def.lat,
          lng: def.lng,
          keywords: def.keywords,
        },
      });
    }
    this.invalidateCache();
  }

  private regionKeywords(region: ExamRegion): string[] {
    if (!Array.isArray(region.keywords)) return [];
    return region.keywords.filter(
      (value): value is string => typeof value === 'string' && value.length > 0,
    );
  }

  matchesRegion(route: RouteRegionFields, region: ExamRegion): boolean {
    const haystack = `${route.city ?? ''} ${route.sourceKey ?? ''}`.toLowerCase();
    return this.regionKeywords(region).some((keyword) =>
      haystack.includes(keyword.toLowerCase()),
    );
  }

  async getRegionForRoute(route: RouteRegionFields): Promise<ExamRegion | null> {
    const regions = await this.loadRegions();
    return regions.find((region) => this.matchesRegion(route, region)) ?? null;
  }

  async isRoutePubliclyVisible(route: RouteRegionFields): Promise<boolean> {
    const region = await this.getRegionForRoute(route);
    if (!region) return true;
    return region.isActive;
  }

  async filterPublicRoutes<T extends RouteRegionFields>(routes: T[]): Promise<T[]> {
    const regions = await this.loadRegions();
    const activeIds = new Set(
      regions.filter((region) => region.isActive).map((region) => region.id),
    );

    return routes.filter((route) => {
      const region = regions.find((item) => this.matchesRegion(route, item));
      if (!region) return true;
      return activeIds.has(region.id);
    });
  }

  async getActiveExamCities() {
    const regions = await this.loadRegions();
    return regions
      .filter((region) => region.isActive)
      .map((region) => ({
        id: region.id,
        name: region.name,
        lat: region.lat,
        lng: region.lng,
      }));
  }

  async findAllForAdmin() {
    await this.ensureDefaults();
    const regions = await this.loadRegions();
    const routes = await this.prisma.route.findMany({
      where: { visibility: 'SYSTEM' },
      select: { city: true, sourceKey: true, isPublished: true },
    });

    return regions.map((region) => {
      const matched = routes.filter((route) => this.matchesRegion(route, region));
      return {
        id: region.id,
        name: region.name,
        lat: region.lat,
        lng: region.lng,
        isActive: region.isActive,
        routeCount: matched.length,
        publishedRouteCount: matched.filter((route) => route.isPublished).length,
        updatedAt: region.updatedAt,
      };
    });
  }

  async setActive(id: string, isActive: boolean) {
    await this.ensureDefaults();
    try {
      const region = await this.prisma.examRegion.update({
        where: { id },
        data: { isActive },
      });
      this.invalidateCache();
      await this.redis.invalidatePublicRoutes();
      return region;
    } catch {
      throw new NotFoundException('Region not found');
    }
  }
}
