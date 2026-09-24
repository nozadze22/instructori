/**
 * Full database clone: users, profiles, routes, steps, saved routes, notes, contacts, regions.
 * Refresh tokens are NOT copied (users sign in again).
 *
 * Modes:
 *   pnpm clone:to-dev
 *     DEV_DATABASE_URL  → DATABASE_URL   (old data → current local/dev Neon)
 *
 *   pnpm clone:to-production
 *     SOURCE_DATABASE_URL → PRODUCTION_DATABASE_URL
 *
 *   --dry-run   preview only
 *   --force     wipe target tables first if not empty
 *   --to-dev    force DEV_DATABASE_URL → DATABASE_URL (same as clone:to-dev)
 */

import 'dotenv/config';
import { PrismaNeon } from '@prisma/adapter-neon';
import {
  assertNotProductionDatabase,
  databaseHost,
  resolveProductionDatabaseUrl,
} from './lib/db-environment.mjs';

function parseArgs(argv) {
  return {
    dryRun: argv.includes('--dry-run'),
    force: argv.includes('--force'),
    toDev: argv.includes('--to-dev'),
  };
}

async function loadPrisma(connectionString) {
  const { PrismaClient } = await import('../src/generated/prisma/client.ts');
  return new PrismaClient({
    adapter: new PrismaNeon({ connectionString }),
  });
}

function omit(obj, keys) {
  const out = { ...obj };
  for (const key of keys) delete out[key];
  return out;
}

async function countAll(prisma) {
  const [users, routes, regions, contacts] = await Promise.all([
    prisma.user.count(),
    prisma.route.count(),
    prisma.examRegion.count(),
    prisma.contact.count(),
  ]);
  return { users, routes, regions, contacts };
}

async function wipeTarget(target, dryRun) {
  if (dryRun) {
    console.log('Dry run — would wipe target tables (except _prisma_migrations).');
    return;
  }
  await target.mistakeNote.deleteMany();
  await target.savedRoute.deleteMany();
  await target.routeStep.deleteMany();
  await target.route.deleteMany();
  await target.profile.deleteMany();
  await target.refreshToken.deleteMany();
  await target.user.deleteMany();
  await target.contact.deleteMany();
  await target.examRegion.deleteMany();
}

async function cloneAll(source, target, dryRun) {
  const users = await source.user.findMany({ orderBy: { createdAt: 'asc' } });
  const profiles = await source.profile.findMany();
  const regions = await source.examRegion.findMany({ orderBy: { id: 'asc' } });
  const routes = await source.route.findMany({
    include: { steps: { orderBy: { order: 'asc' } } },
    orderBy: { createdAt: 'asc' },
  });
  const saved = await source.savedRoute.findMany();
  const notes = await source.mistakeNote.findMany();
  const contacts = await source.contact.findMany({ orderBy: { createdAt: 'asc' } });

  console.log(
    `Source: ${users.length} users, ${routes.length} routes, ${regions.length} regions, ${contacts.length} contacts`,
  );

  if (dryRun) return { users: users.length, routes: routes.length };

  for (const user of users) {
    await target.user.create({
      data: omit(user, ['profile', 'routes', 'savedRoutes', 'mistakeNotes', 'refreshTokens']),
    });
  }

  for (const profile of profiles) {
    await target.profile.create({ data: omit(profile, ['user']) });
  }

  for (const region of regions) {
    await target.examRegion.create({ data: region });
  }

  for (const route of routes) {
    const steps = route.steps.map((step) => omit(step, ['route', 'routeId']));
    await target.route.create({
      data: {
        ...omit(route, ['steps', 'createdBy', 'savedBy', 'mistakeNotes']),
        steps: { create: steps },
      },
    });
  }

  for (const row of saved) {
    await target.savedRoute.create({ data: omit(row, ['user', 'route']) });
  }

  for (const note of notes) {
    await target.mistakeNote.create({
      data: omit(note, ['instructor', 'route']),
    });
  }

  for (const contact of contacts) {
    await target.contact.create({ data: contact });
  }

  return {
    users: users.length,
    routes: routes.length,
    saved: saved.length,
    notes: notes.length,
  };
}

async function main() {
  const args = parseArgs(process.argv);

  let sourceUrl;
  let targetUrl;
  let nextHint;

  if (args.toDev) {
    sourceUrl = process.env.DEV_DATABASE_URL?.trim();
    targetUrl = process.env.DATABASE_URL?.trim();
    if (!sourceUrl) {
      throw new Error('Set DEV_DATABASE_URL (old data to copy from).');
    }
    if (!targetUrl) {
      throw new Error('Set DATABASE_URL (new/current dev target).');
    }
    nextHint =
      'Done. Restart backend (pnpm start) — it already uses DATABASE_URL.';
  } else {
    sourceUrl =
      process.env.SOURCE_DATABASE_URL?.trim() ||
      process.env.DEV_DATABASE_URL?.trim() ||
      process.env.DATABASE_URL?.trim();
    targetUrl = resolveProductionDatabaseUrl();
    if (!sourceUrl) {
      throw new Error(
        'Set SOURCE_DATABASE_URL or DEV_DATABASE_URL (source).',
      );
    }
    if (!targetUrl) {
      throw new Error('Set PRODUCTION_DATABASE_URL (new empty DB).');
    }
    nextHint =
      'Next: fly secrets set DATABASE_URL="<new pooled url>" -a simdrive-pro-api && redeploy';
  }

  if (sourceUrl === targetUrl) {
    throw new Error('Source and target URLs must differ.');
  }

  assertNotProductionDatabase(sourceUrl, 'clone-database source');
  if (args.toDev) {
    assertNotProductionDatabase(targetUrl, 'clone-database target (dev)');
  }

  console.log(`Source host: ${databaseHost(sourceUrl)}`);
  console.log(`Target host: ${databaseHost(targetUrl)}`);

  const source = await loadPrisma(sourceUrl);
  const target = await loadPrisma(targetUrl);

  try {
    const targetCounts = await countAll(target);
    const targetTotal =
      targetCounts.users + targetCounts.routes + targetCounts.regions;

    if (targetTotal > 0 && !args.force) {
      throw new Error(
        `Target DB is not empty (${targetCounts.users} users, ${targetCounts.routes} routes). ` +
          'Use --force to wipe target first, or use a fresh Neon project.',
      );
    }

    if (targetTotal > 0 && args.force && !args.dryRun) {
      console.warn('Wiping target…');
      await wipeTarget(target, false);
    }

    if (!args.dryRun) {
      const migrated = await target.$queryRaw`
        SELECT COUNT(*)::int AS c FROM "_prisma_migrations" WHERE finished_at IS NOT NULL
      `.catch(() => [{ c: 0 }]);
      if (!migrated[0]?.c) {
        throw new Error(
          args.toDev
            ? 'Target has no migrations. Run: pnpm prisma migrate deploy'
            : 'Target has no migrations. Run: PRODUCTION_DATABASE_URL=... pnpm prisma migrate deploy',
        );
      }
    }

    const result = await cloneAll(source, target, args.dryRun);
    console.log(args.dryRun ? 'Dry run OK.' : 'Clone finished.', result);
    if (!args.dryRun) {
      console.log(nextHint);
    }
  } finally {
    await source.$disconnect();
    await target.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
