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

const DEMO = {
  sourceKey: 'demo-poti-1',
  title: 'ფოთი — Demo სიმულაცია #1',
  city: 'ფოთი',
  description:
    'დემო საგამოცდო მარშრუტი სიმულაციისა და ხმოვანი ბრძანებების საჩვენებლად. გზაზე მოძრაობისას აპლიკაცია თვითონ ამბობს მითითებებს.',
  path: [
    [41.6712, 42.1468],
    [41.6728, 42.1476],
    [41.6745, 42.1484],
    [41.6762, 42.1491],
    [41.6778, 42.1498],
    [41.6789, 42.1506],
    [41.6795, 42.1518],
    [41.6792, 42.1532],
    [41.6784, 42.1545],
    [41.6771, 42.1556],
    [41.6754, 42.1562],
    [41.6736, 42.1565],
    [41.6718, 42.1561],
    [41.6704, 42.1552],
    [41.6695, 42.1539],
    [41.6692, 42.1524],
    [41.6698, 42.151],
    [41.671, 42.1498],
    [41.6718, 42.1484],
    [41.6712, 42.1468],
  ],
  steps: [
    {
      order: 0,
      lat: 42.1484,
      lng: 41.6745,
      action: 'TURN_RIGHT',
      distanceBeforeVoice: 120,
      voiceText: '120 მეტრში მოუხვიეთ მარჯვნივ.',
    },
    {
      order: 1,
      lat: 42.1518,
      lng: 41.6795,
      action: 'TURN_LEFT',
      distanceBeforeVoice: 100,
      voiceText: '100 მეტრში მოუხვიეთ მარცხნივ.',
    },
    {
      order: 2,
      lat: 42.1556,
      lng: 41.6771,
      action: 'STOP',
      distanceBeforeVoice: 80,
      voiceText: '80 მეტრში გააჩერეთ. შეამოწმეთ სარკეები.',
    },
    {
      order: 3,
      lat: 42.1561,
      lng: 41.6718,
      action: 'TURN_LEFT',
      distanceBeforeVoice: 100,
      voiceText: '100 მეტრში მოუხვიეთ მარცხნივ.',
    },
    {
      order: 4,
      lat: 42.1524,
      lng: 41.6692,
      action: 'U_TURN',
      distanceBeforeVoice: 90,
      voiceText: '90 მეტრში შეაბრუნეთ.',
    },
    {
      order: 5,
      lat: 42.1484,
      lng: 41.6718,
      action: 'PARKING',
      distanceBeforeVoice: 80,
      voiceText: 'მოახლოვდით საწყის წერტილს. დაიწყეთ დაპარკინგება.',
    },
  ],
};

async function main() {
  const { PrismaClient } = await loadPrisma();
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    select: { id: true, email: true },
  });
  if (!admin) throw new Error('ADMIN user not found');

  const existing = await prisma.route.findUnique({
    where: { sourceKey: DEMO.sourceKey },
    select: { id: true },
  });

  let routeId;
  if (existing) {
    await prisma.routeStep.deleteMany({ where: { routeId: existing.id } });
    const updated = await prisma.route.update({
      where: { id: existing.id },
      data: {
        title: DEMO.title,
        description: DEMO.description,
        city: DEMO.city,
        path: DEMO.path,
        visibility: 'SYSTEM',
        isPublished: true,
        steps: { create: DEMO.steps },
      },
      select: { id: true },
    });
    routeId = updated.id;
  } else {
    const created = await prisma.route.create({
      data: {
        title: DEMO.title,
        description: DEMO.description,
        city: DEMO.city,
        sourceKey: DEMO.sourceKey,
        path: DEMO.path,
        visibility: 'SYSTEM',
        isPublished: true,
        createdById: admin.id,
        steps: { create: DEMO.steps },
      },
      select: { id: true },
    });
    routeId = created.id;
  }

  console.log(`Demo route ready: ${DEMO.title}`);
  console.log(`id=${routeId}`);
  console.log(`Open /admin/routes/${routeId}`);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
