import 'dotenv/config';
import { PrismaNeon } from '@prisma/adapter-neon';

async function main() {
  const { PrismaClient } = await import('../src/generated/prisma/client.ts');
  const prisma = new PrismaClient({
    adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }),
  });

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
