/**
 * Set the official exam-route description on all SYSTEM routes.
 *
 * Usage: node scripts/fix-route-descriptions.mjs
 */

import 'dotenv/config';
import { PrismaNeon } from '@prisma/adapter-neon';
import { OFFICIAL_EXAM_ROUTE_DESCRIPTION } from './exam-route-description.mjs';

async function loadPrisma() {
  const candidates = [
    new URL('../dist/src/generated/prisma/client.js', import.meta.url).href,
    new URL('../src/generated/prisma/client.ts', import.meta.url).href,
  ];

  for (const href of candidates) {
    try {
      return await import(href);
    } catch {
      // try next
    }
  }

  throw new Error(
    'Prisma client not found. Run: pnpm prisma:generate (and use tsx to run import scripts)',
  );
}

async function main() {
  const { PrismaClient } = await loadPrisma();
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const result = await prisma.route.updateMany({
    where: {
      visibility: 'SYSTEM',
      NOT: { description: OFFICIAL_EXAM_ROUTE_DESCRIPTION },
    },
    data: {
      description: OFFICIAL_EXAM_ROUTE_DESCRIPTION,
    },
  });

  console.log(`Updated ${result.count} system route descriptions.`);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
