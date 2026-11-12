import type { Role as PrismaRole } from '@prisma/client';

export type Role = 'ADMIN' | 'INSTRUCTOR' | 'USER';

export function toAuthRole(role: PrismaRole): Role {
  return role;
}

export type AccessStatus = 'PENDING' | 'ACTIVE' | 'BLOCKED';

export type AccessSource = 'ADMIN' | 'PAYMENT';

export interface AuthUser {
  userId: string;
  email: string;
  fullName: string;
  role: Role;
  accessStatus: AccessStatus;
  accessSource: AccessSource | null;
  instructorCode?: string | null;
}
