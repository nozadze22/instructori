import 'dotenv/config';
import { writeFileSync } from 'fs';
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
const { PrismaClient } = await loadPrisma();

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }),
});

const route = await prisma.route.findUnique({
  where: { id: '291b8f19-614c-42ac-bff6-33dad11e03ec' },
});
writeFileSync('tmp-batumi-1-path.json', JSON.stringify(route.path, null, 2));
console.log('points', route.path.length);
await prisma.$disconnect();
