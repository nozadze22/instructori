/**
 * Replace only soon roundabout cues in RouteStep voiceText:
 *
 *   "მალe წრიულ გზაჯვარედინზe" → "მალe წრიული მოძრაობაზe"
 *
 * Leaves "300 მეტრში წრიულ გზაჯვარედინზe …" unchanged.
 *
 * Usage (uses DATABASE_URL from .env):
 *   npx tsx scripts/fix-roundabout-voice-text.mjs --dry-run
 *   npx tsx scripts/fix-roundabout-voice-text.mjs
 */

import 'dotenv/config';
import { PrismaNeon } from '@prisma/adapter-neon';
import {
  SOON_ROUNDABOUT_VOICE_FROM,
  SOON_ROUNDABOUT_VOICE_TO,
} from './simulatori-voice-text.mjs';

function parseArgs(argv) {
  return { dryRun: argv.includes('--dry-run') };
}

async function main() {
  const { dryRun } = parseArgs(process.argv);
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  const { PrismaClient } = await import('../src/generated/prisma/client.ts');
  const prisma = new PrismaClient({
    adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }),
  });

  const steps = await prisma.routeStep.findMany({
    where: { voiceText: { startsWith: SOON_ROUNDABOUT_VOICE_FROM } },
    select: {
      id: true,
      voiceText: true,
      route: { select: { title: true, sourceKey: true } },
    },
    orderBy: { routeId: 'asc' },
  });

  const preview = steps.slice(0, 5).map((step) => ({
    route: step.route.sourceKey ?? step.route.title,
    before: step.voiceText,
    after:
      SOON_ROUNDABOUT_VOICE_TO +
      step.voiceText.slice(SOON_ROUNDABOUT_VOICE_FROM.length),
  }));

  if (dryRun) {
    console.log(
      JSON.stringify(
        { dryRun: true, matched: steps.length, preview },
        null,
        2,
      ),
    );
    await prisma.$disconnect();
    return;
  }

  let updated = 0;
  for (const step of steps) {
    if (!step.voiceText?.startsWith(SOON_ROUNDABOUT_VOICE_FROM)) continue;
    await prisma.routeStep.update({
      where: { id: step.id },
      data: {
        voiceText:
          SOON_ROUNDABOUT_VOICE_TO +
          step.voiceText.slice(SOON_ROUNDABOUT_VOICE_FROM.length),
      },
    });
    updated += 1;
  }

  console.log(JSON.stringify({ matched: steps.length, updated, preview }, null, 2));
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
