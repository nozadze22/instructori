/**
 * Copy exam regions + SYSTEM routes (with steps) from production → local dev.
 *
 * .env:
 *   PRODUCTION_DATABASE_URL = production (read)
 *   DATABASE_URL            = dev (write)
 *
 * Does NOT copy users, chat, notifications, etc.
 *
 * Usage:
 *   pnpm sync:from-production
 *   pnpm sync:from-production -- --dry-run
 *   pnpm sync:from-production -- --regions-only
 */

import 'dotenv/config';
import { PrismaNeon } from '@prisma/adapter-neon';
import {
  assertNotProductionDatabase,
  resolveProductionDatabaseUrl,
} from './lib/db-environment.mjs';

function parseArgs(argv) {
  return {
    dryRun: argv.includes('--dry-run'),
    regionsOnly: argv.includes('--regions-only'),
  };
}

async function loadPrisma(connectionString) {
  const { PrismaClient } = await import('../src/generated/prisma/client.ts');
  return new PrismaClient({
    adapter: new PrismaNeon({ connectionString }),
  });
}

function routeStepPayload(steps) {
  return steps.map((step) => ({
    order: step.order,
    lat: step.lat,
    lng: step.lng,
    action: step.action,
    distanceBeforeVoice: step.distanceBeforeVoice,
    voiceText: step.voiceText,
    audioUrl: step.audioUrl,
  }));
}

function routePayload(route) {
  return {
    title: route.title,
    description: route.description,
    city: route.city,
    sourceKey: route.sourceKey,
    sourceUrl: route.sourceUrl,
    path: route.path,
    visibility: route.visibility,
    isPublished: route.isPublished,
  };
}

async function copyRegions(source, target, dryRun) {
  const regions = await source.examRegion.findMany({
    orderBy: { name: 'asc' },
  });

  console.log(`Regions to copy: ${regions.length}`);

  if (dryRun) return { copied: regions.length };

  for (const region of regions) {
    await target.examRegion.upsert({
      where: { id: region.id },
      create: {
        id: region.id,
        name: region.name,
        lat: region.lat,
        lng: region.lng,
        keywords: region.keywords,
        isActive: region.isActive,
      },
      update: {
        name: region.name,
        lat: region.lat,
        lng: region.lng,
        keywords: region.keywords,
        isActive: region.isActive,
      },
    });
  }

  return { copied: regions.length };
}

async function copyRoutes(source, target, dryRun) {
  const routes = await source.route.findMany({
    where: { visibility: 'SYSTEM' },
    include: { steps: { orderBy: { order: 'asc' } } },
    orderBy: { sourceKey: 'asc' },
  });

  console.log(`System routes to copy: ${routes.length}`);

  if (dryRun) {
    return { copied: routes.length, skipped: 0 };
  }

  const owner =
    (await target.user.findFirst({
      where: { role: 'ADMIN' },
      select: { id: true, email: true, role: true },
    })) ??
    (await target.user.findFirst({
      where: { role: 'INSTRUCTOR' },
      select: { id: true, email: true, role: true },
    }));
  if (!owner) {
    throw new Error(
      'Dev DB has no user for route ownership. Create admin via /admin/setup, then rerun.',
    );
  }

  console.log(`Using dev owner: ${owner.email} (${owner.role})`);

  let copied = 0;
  let skipped = 0;

  for (const route of routes) {
    if (!route.sourceKey) {
      console.warn(`Skip route without sourceKey: ${route.id} (${route.title})`);
      skipped += 1;
      continue;
    }

    const payload = routePayload(route);
    const steps = routeStepPayload(route.steps);
    const existing = await target.route.findUnique({
      where: { sourceKey: route.sourceKey },
      select: { id: true },
    });

    if (existing) {
      await target.routeStep.deleteMany({ where: { routeId: existing.id } });
      await target.route.update({
        where: { id: existing.id },
        data: {
          ...payload,
          steps: { create: steps },
        },
      });
    } else {
      await target.route.create({
        data: {
          ...payload,
          createdById: owner.id,
          steps: { create: steps },
        },
      });
    }

    copied += 1;
    console.log(`  ✓ ${route.sourceKey} (${route.city ?? '—'}) — ${steps.length} steps`);
  }

  return { copied, skipped };
}

async function main() {
  const args = parseArgs(process.argv);
  const sourceUrl = resolveProductionDatabaseUrl();
  const targetUrl = process.env.DATABASE_URL?.trim();

  if (!sourceUrl) {
    throw new Error('PRODUCTION_DATABASE_URL is missing in .env.');
  }
  if (!targetUrl) {
    throw new Error('DATABASE_URL is missing in .env (dev target).');
  }
  if (sourceUrl === targetUrl) {
    throw new Error('PRODUCTION_DATABASE_URL and DATABASE_URL must differ.');
  }

  assertNotProductionDatabase(targetUrl, 'sync-from-production target (dev)');

  const source = await loadPrisma(sourceUrl);
  const target = await loadPrisma(targetUrl);

  try {
    console.log(args.dryRun ? 'Dry run…' : 'Copying production → dev (regions + system routes)…');

    const regionResult = await copyRegions(source, target, args.dryRun);
    console.log(`Regions: ${regionResult.copied}`);

    if (!args.regionsOnly) {
      const routeResult = await copyRoutes(source, target, args.dryRun);
      console.log(
        `Routes: ${routeResult.copied} copied` +
          (routeResult.skipped ? `, ${routeResult.skipped} skipped` : ''),
      );
    }

    if (args.dryRun) {
      console.log('Dry run OK — rerun without --dry-run to apply.');
    } else {
      console.log('Done.');
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
