import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';
import type { AuthUser } from '../dto/auth-types';

/**
 * Public route catalog/detail stay open for guests and ACTIVE users.
 * Logged-in instructors without ACTIVE access must not load full route data.
 */
@Injectable()
export class PublicRoutesAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthUser }>();

    const user = req.user;
    if (!user) {
      return true;
    }

    if (user.role === 'ADMIN') {
      return true;
    }

    if (user.accessStatus === 'BLOCKED') {
      throw new ForbiddenException('Account is blocked');
    }

    if (user.role === 'INSTRUCTOR' && user.accessStatus !== 'ACTIVE') {
      throw new ForbiddenException('Access pending approval');
    }

    return true;
  }
}