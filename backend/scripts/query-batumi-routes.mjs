import { createDevPrisma } from './lib/load-dev-prisma.mjs';

async function main() {
  const prisma = await createDevPrisma('query-batumi-routes');

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
