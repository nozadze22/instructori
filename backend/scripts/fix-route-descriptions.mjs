/**
 * Set the official exam-route description on all SYSTEM routes.
 *
 * Usage: node scripts/fix-route-descriptions.mjs
 */

import { OFFICIAL_EXAM_ROUTE_DESCRIPTION } from './exam-route-description.mjs';
import { createDevPrisma } from './lib/load-dev-prisma.mjs';

async function main() {
  const prisma = await createDevPrisma('fix-route-descriptions');

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
