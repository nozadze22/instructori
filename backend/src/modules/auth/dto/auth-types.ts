export type Role = 'ADMIN' | 'INSTRUCTOR';

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
