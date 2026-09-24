import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '../generated/prisma/client';

const PRODUCTION_DB_HOST_MARKERS = [
  'ep-still-violet-asdr91ls',
  'ep-rapid-grass-b2jc1vz2',
];

function resolveDatabaseUrl(config: ConfigService): string {
  const fromConfig =
    config.get<string>('DATABASE_URL')?.trim() ||
    config.get<string>('SOURCE_DATABASE_URL')?.trim();
  const fromEnv =
    process.env.DATABASE_URL?.trim() ||
    process.env.SOURCE_DATABASE_URL?.trim();

  const connectionString = fromConfig || fromEnv;
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL is missing. Add it to backend/.env (use dev Neon, not PRODUCTION_DATABASE_URL).',
    );
  }
  return connectionString;
}

function isProductionDatabaseHost(connectionString: string): boolean {
  try {
    const host = new URL(
      connectionString.replace(/^postgres:/, 'postgresql:'),
    ).hostname;
    const extra = process.env.PRODUCTION_DB_HOST_MARKERS?.split(',')
      .map((part) => part.trim())
      .filter(Boolean);
    const markers = extra?.length ? extra : PRODUCTION_DB_HOST_MARKERS;
    return markers.some((marker) => host.includes(marker));
  } catch {
    return false;
  }
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(config: ConfigService) {
    const connectionString = resolveDatabaseUrl(config);
    const adapter = new PrismaNeon({ connectionString });
    super({ adapter });
  }

  onModuleInit() {
    const connectionString =
      process.env.DATABASE_URL?.trim() ||
      process.env.SOURCE_DATABASE_URL?.trim() ||
      '';
    const isProdHost = isProductionDatabaseHost(connectionString);
    const nodeEnv = process.env.NODE_ENV ?? 'development';

    if (nodeEnv !== 'production' && isProdHost) {
      const message =
        'DATABASE_URL points at production Neon while NODE_ENV is not production. ' +
        'Use dev DATABASE_URL locally; set PRODUCTION_DATABASE_URL only for sync/clone.';

      if (process.env.BLOCK_PRODUCTION_DATABASE === '1') {
        throw new Error(message);
      }

      this.logger.warn(message);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
