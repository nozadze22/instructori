import type { Role as PrismaRole } from '../../../generated/prisma/enums';

export type Role = 'ADMIN' | 'INSTRUCTOR';

export function toAuthRole(role: PrismaRole): Role {
  return role === 'USER' ? 'INSTRUCTOR' : role;
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
}
