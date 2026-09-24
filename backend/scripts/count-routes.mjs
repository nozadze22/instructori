import { createDevPrisma } from './lib/load-dev-prisma.mjs';

async function main() {
  const prisma = await createDevPrisma('count-routes');

  const total = await prisma.route.count();
  const system = await prisma.route.count({ where: { visibility: 'SYSTEM' } });
  const published = await prisma.route.count({ where: { isPublished: true } });
  const steps = await prisma.routeStep.count();
  const byCity = await prisma.route.groupBy({
    by: ['city'],
    _count: { _all: true },
    orderBy: { city: 'asc' },
  });

  console.log(
    JSON.stringify(
      {
        total,
        system,
        published,
        steps,
        byCity: byCity.map((row) => ({
          city: row.city,
          count: row._count._all,
        })),
      },
      null,
      2,
    ),
  );

  await prisma.$disconnect();
}

main().catch(console.error);
