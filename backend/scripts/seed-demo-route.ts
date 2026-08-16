import 'dotenv/config';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '../src/generated/prisma/client';
import { DEMO_POTI_ROUTE } from '../src/modules/routes/data/demo-poti-route';

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is missing');
  }

  const adapter = new PrismaNeon({ connectionString });
  const prisma = new PrismaClient({ adapter });

  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    select: { id: true, email: true },
  });

  if (!admin) {
    throw new Error('ADMIN user not found — create an admin first');
  }

  const existing = await prisma.route.findUnique({
    where: { sourceKey: DEMO_POTI_ROUTE.sourceKey },
    select: { id: true },
  });

  const routeId = existing
    ? (
        await prisma.$transaction(async (tx) => {
          await tx.routeStep.deleteMany({ where: { routeId: existing.id } });
          return tx.route.update({
            where: { id: existing.id },
            data: {
              title: DEMO_POTI_ROUTE.title,
              description: DEMO_POTI_ROUTE.description,
              city: DEMO_POTI_ROUTE.city,
              path: DEMO_POTI_ROUTE.path,
              visibility: 'SYSTEM',
              isPublished: true,
              steps: {
                create: DEMO_POTI_ROUTE.steps,
              },
            },
            select: { id: true },
          });
        })
      ).id
    : (
        await prisma.route.create({
          data: {
            title: DEMO_POTI_ROUTE.title,
            description: DEMO_POTI_ROUTE.description,
            city: DEMO_POTI_ROUTE.city,
            sourceKey: DEMO_POTI_ROUTE.sourceKey,
            path: DEMO_POTI_ROUTE.path,
            visibility: 'SYSTEM',
            isPublished: true,
            createdById: admin.id,
            steps: {
              create: DEMO_POTI_ROUTE.steps,
            },
          },
          select: { id: true },
        })
      ).id;

  console.log(`Demo route ready: ${DEMO_POTI_ROUTE.title}`);
  console.log(`id=${routeId}`);
  console.log(`admin=${admin.email}`);
  console.log(`Open: /admin/routes/${routeId}`);

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  process.exit(1);
});
