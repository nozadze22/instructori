import 'dotenv/config';
import { readFileSync } from 'fs';
import { PrismaNeon } from '@prisma/adapter-neon';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

async function loadPrisma() {
  try {
    return require('../dist/src/generated/prisma/client.js');
  } catch {
    return require('../src/generated/prisma/client.js');
  }
}

async function main() {
  const { PrismaClient } = await loadPrisma();
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

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
