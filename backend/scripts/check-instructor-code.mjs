import { createDevPrisma } from './lib/load-dev-prisma.mjs';

const code = process.argv[2]?.trim().toUpperCase();
const prisma = await createDevPrisma('check-instructor-code');

const byCode = code
  ? await prisma.user.findFirst({
      where: { instructorCode: code },
      select: {
        email: true,
        role: true,
        accessStatus: true,
        instructorCode: true,
        fullName: true,
      },
    })
  : null;

const students = await prisma.user.findMany({
  where: { email: { contains: 'instructorinst', mode: 'insensitive' } },
  select: {
    email: true,
    role: true,
    accessStatus: true,
    linkedInstructorId: true,
    fullName: true,
  },
});

console.log(JSON.stringify({ code, byCode, students }, null, 2));
await prisma.$disconnect();
