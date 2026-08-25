import 'dotenv/config';
import { PrismaNeon } from '@prisma/adapter-neon';
import { createRequire } from 'module';
import { BATUMI_ROUTES } from '../src/modules/routes/data/batumi-routes.mjs';

const require = createRequire(import.meta.url);

async function loadPrisma() {
  try {
    return require('../dist/src/generated/prisma/client.js');
  } catch {
    return require('../src/generated/prisma/client.js');
  }
}

async function upsertRoute(prisma, adminId, route) {
  if (route.updateOnly) {
    return prisma.route.update({
      where: { id: route.existingRouteId },
      data: {
        title: route.title,
        description: route.description,
        city: route.city,
        sourceKey: route.sourceKey,
        sourceUrl: route.sourceUrl,
        visibility: 'SYSTEM',
        isPublished: true,
      },
      select: { id: true, title: true, sourceKey: true },
    });
  }

  const existing = await prisma.route.findUnique({
    where: { sourceKey: route.sourceKey },
    select: { id: true },
  });

  if (existing) {
    await prisma.routeStep.deleteMany({ where: { routeId: existing.id } });
    return prisma.route.update({
      where: { id: existing.id },
      data: {
        title: route.title,
        description: route.description,
        city: route.city,
        sourceUrl: route.sourceUrl,
        path: route.path,
        visibility: 'SYSTEM',
        isPublished: true,
        steps: { create: route.steps },
      },
      select: { id: true, title: true, sourceKey: true },
    });
  }

  return prisma.route.create({
    data: {
      title: route.title,
      description: route.description,
      city: route.city,
      sourceKey: route.sourceKey,
      sourceUrl: route.sourceUrl,
      path: route.path,
      visibility: 'SYSTEM',
      isPublished: true,
      createdById: adminId,
      steps: { create: route.steps },
    },
    select: { id: true, title: true, sourceKey: true },
  });
}

async function main() {
  const { PrismaClient } = await loadPrisma();
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    select: { id: true, email: true },
  });
  if (!admin) throw new Error('ADMIN user not found');

  for (const route of BATUMI_ROUTES) {
    const saved = await upsertRoute(prisma, admin.id, route);
    console.log(`OK ${saved.sourceKey} -> ${saved.title} (${saved.id})`);
  }

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
