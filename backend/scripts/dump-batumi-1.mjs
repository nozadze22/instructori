import { readFileSync } from 'fs';
import { createDevPrisma } from './lib/load-dev-prisma.mjs';

async function main() {
  const prisma = await createDevPrisma('dump-batumi-1');

  const route = await prisma.route.findUnique({
    where: { id: '291b8f19-614c-42ac-bff6-33dad11e03ec' },
    include: { steps: { orderBy: { order: 'asc' } } },
  });

  console.log(
    JSON.stringify(
      {
        title: route?.title,
        pathLen: Array.isArray(route?.path) ? route.path.length : 0,
        steps: route?.steps.map((step) => ({
          order: step.order,
          action: step.action,
          voiceText: step.voiceText,
          lat: step.lat,
          lng: step.lng,
        })),
      },
      null,
      2,
    ),
  );

  await prisma.$disconnect();
}

main().catch(console.error);
