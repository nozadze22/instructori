import 'dotenv/config';
import { PrismaNeon } from '@prisma/adapter-neon';
import { assertNotProductionDatabase } from './db-environment.mjs';

export function resolveDevDatabaseUrl() {
  const url =
    process.env.DATABASE_URL?.trim() || process.env.SOURCE_DATABASE_URL?.trim();
  if (!url) {
    throw new Error(
      'Set DATABASE_URL (dev) in .env — do not point everyday scripts at PRODUCTION_DATABASE_URL.',
    );
  }
  return url;
}

export async function createDevPrisma(context) {
  const connectionString = resolveDevDatabaseUrl();
  assertNotProductionDatabase(connectionString, context);
  const { PrismaClient } = await import('../../src/generated/prisma/client.ts');
  return new PrismaClient({
    adapter: new PrismaNeon({ connectionString }),
  });
}
