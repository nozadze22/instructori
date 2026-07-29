export type Role = 'ADMIN' | 'INSTRUCTOR';

export interface AuthUser {
  userId: string;
  email: string;
  fullName: string;
  role: Role;
}
