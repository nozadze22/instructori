import { writeFileSync } from 'fs';
import { createDevPrisma } from './lib/load-dev-prisma.mjs';

const prisma = await createDevPrisma('export-batumi-1-path');

const route = await prisma.route.findUnique({
  where: { id: '291b8f19-614c-42ac-bff6-33dad11e03ec' },
});
writeFileSync('tmp-batumi-1-path.json', JSON.stringify(route.path, null, 2));
console.log('points', route.path.length);
await prisma.$disconnect();
