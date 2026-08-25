import 'dotenv/config';
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

  const routes = await prisma.route.findMany({
    where: {
      OR: [
        { city: { contains: 'ბათუმ', mode: 'insensitive' } },
        { sourceKey: { startsWith: 'batumi' } },
      ],
    },
    include: {
      steps: { orderBy: { order: 'asc' } },
      createdBy: { select: { email: true, role: true } },
    },
    orderBy: { title: 'asc' },
  });

  console.log(
    JSON.stringify(
      routes.map((route) => ({
        id: route.id,
        title: route.title,
        sourceKey: route.sourceKey,
        city: route.city,
        pathPoints: Array.isArray(route.path) ? route.path.length : 0,
        steps: route.steps.length,
        published: route.isPublished,
        visibility: route.visibility,
        createdBy: route.createdBy.email,
      })),
      null,
      2,
    ),
  );

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
