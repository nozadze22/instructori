import { UnauthorizedException } from '@nestjs/common';
import type { AuthUser } from './auth-types';

export type AccessJwtPayload = {
  sub: string;
  email: string;
  fullName: string;
  role: AuthUser['role'];
  accessStatus?: AuthUser['accessStatus'];
  accessSource?: AuthUser['accessSource'] | null;
  sv?: number;
  purpose?: string;
};

export function authUserFromAccessJwt(payload: AccessJwtPayload): AuthUser {
  if (payload.purpose) {
    throw new UnauthorizedException('Invalid token');
  }
  if (!payload.sub || !payload.email || !payload.fullName || !payload.role) {
    throw new UnauthorizedException('Invalid token');
  }

  const accessStatus = payload.accessStatus ?? 'ACTIVE';
  if (accessStatus === 'BLOCKED') {
    throw new UnauthorizedException('Account is blocked');
  }

  return {
    userId: payload.sub,
    email: payload.email,
    fullName: payload.fullName,
    role: payload.role,
    accessStatus,
    accessSource: payload.accessSource ?? null,
  };
}
