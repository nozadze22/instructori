import { BadRequestException } from '@nestjs/common';
import type { PrismaService } from '../../prisma/prisma.service';

const INSTRUCTOR_CODE_PATTERN = /^[A-F0-9]{8}$/;

export function normalizeInstructorCode(rawCode: string): string {
  return rawCode.trim().toUpperCase();
}

export function assertInstructorCodeFormat(rawCode: string): string {
  const instructorCode = normalizeInstructorCode(rawCode);
  if (!INSTRUCTOR_CODE_PATTERN.test(instructorCode)) {
    throw new BadRequestException(
      'ინსტრუქტორის კოდი 8 ასო-რიცხვი უნდა იყოს (მაგ. A1B2C3D4)',
    );
  }
  return instructorCode;
}

/** Student registration / profile join — ACTIVE and PENDING instructors (not BLOCKED). */
export async function findInstructorByCodeForStudentLink(
  prisma: PrismaService,
  rawCode: string,
): Promise<{ id: string }> {
  const instructorCode = assertInstructorCodeFormat(rawCode);

  const instructor = await prisma.user.findFirst({
    where: {
      instructorCode,
      role: 'INSTRUCTOR',
      accessStatus: { in: ['ACTIVE', 'PENDING'] },
    },
    select: { id: true },
  });

  if (instructor) {
    return instructor;
  }

  const blocked = await prisma.user.findFirst({
    where: {
      instructorCode,
      role: 'INSTRUCTOR',
      accessStatus: 'BLOCKED',
    },
    select: { id: true },
  });

  if (blocked) {
    throw new BadRequestException(
      'ეს ინსტრუქტორის კოდი აღარ არის ხელმისაწვდომი',
    );
  }

  throw new BadRequestException(
    'ინსტრუქტორის კოდი არასწორია — შეამოწმე ასო-რიცხვები და სცადე თავიდან',
  );
}

/** Directory / features that require a fully approved instructor. */
export async function findActiveInstructorByCode(
  prisma: PrismaService,
  rawCode: string,
): Promise<{ id: string }> {
  const instructorCode = assertInstructorCodeFormat(rawCode);

  const active = await prisma.user.findFirst({
    where: {
      instructorCode,
      role: 'INSTRUCTOR',
      accessStatus: 'ACTIVE',
    },
    select: { id: true },
  });

  if (active) {
    return active;
  }

  const match = await prisma.user.findFirst({
    where: { instructorCode, role: 'INSTRUCTOR' },
    select: { accessStatus: true },
  });

  if (match?.accessStatus === 'PENDING') {
    throw new BadRequestException(
      'ინსტრუქტორი ჯერ არ არის დაამტკიცებული — ჯგუფს მხოლოდ ACTIVE ანგარიშის კოდით შეუერთდები',
    );
  }

  if (match?.accessStatus === 'BLOCKED') {
    throw new BadRequestException(
      'ეს ინსტრუქტორის კოდი აღარ არის ხელმისაწვდომი',
    );
  }

  throw new BadRequestException(
    'ინსტრუქტორის კოდი არასწორია — შეამოწმე ასო-რიცხვები და სცადე თავიდან',
  );
}
