import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from '@upstash/redis';

const VERSION_KEY = 'public:routes:cache-ver';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis | null;
  private versionCache: number | null = null;

  constructor(config: ConfigService) {
    const url = config.get<string>('UPSTASH_REDIS_REST_URL')?.trim();
    const token = config.get<string>('UPSTASH_REDIS_REST_TOKEN')?.trim();

    if (url && token) {
      this.client = new Redis({ url, token });
      this.logger.log('Upstash Redis connected');
    } else {
      this.client = null;
      this.logger.warn(
        'UPSTASH_REDIS_REST_URL/TOKEN missing — route cache disabled',
      );
    }
  }

  get enabled() {
    return this.client != null;
  }

  onModuleDestroy() {
    // REST client has nothing to close
  }

  async getJson<T>(key: string): Promise<T | null> {
    if (!this.client) return null;
    try {
      const value = await this.client.get<T>(key);
      return value ?? null;
    } catch (error) {
      this.logger.warn(
        `Redis GET failed (${key}): ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
  }

  async setJson(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.set(key, value, { ex: ttlSeconds });
    } catch (error) {
      this.logger.warn(
        `Redis SET failed (${key}): ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async currentVersion(): Promise<number> {
    if (!this.client) return 0;
    if (this.versionCache != null) return this.versionCache;
    try {
      const value = await this.client.get<number>(VERSION_KEY);
      this.versionCache = Number(value ?? 0) || 0;
      return this.versionCache;
    } catch {
      return 0;
    }
  }

  /** Bump version so old catalog/detail keys expire naturally. */
  async invalidatePublicRoutes(): Promise<void> {
    if (!this.client) return;
    try {
      const next = await this.client.incr(VERSION_KEY);
      this.versionCache = Number(next) || 0;
      this.logger.debug(`Public routes cache version → ${this.versionCache}`);
    } catch (error) {
      this.versionCache = null;
      this.logger.warn(
        `Redis invalidate failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async catalogKey(parts: {
    q?: string;
    city?: string;
    page: number;
    pageSize: number;
  }) {
    const ver = await this.currentVersion();
    const q = parts.q?.trim().toLowerCase() || '';
    const city = parts.city?.trim() || '';
    return `public:routes:v${ver}:catalog:${parts.page}:${parts.pageSize}:${encodeURIComponent(city)}:${encodeURIComponent(q)}`;
  }

  async detailKey(routeId: string) {
    const ver = await this.currentVersion();
    return `public:routes:v${ver}:detail:${routeId}`;
  }
}
