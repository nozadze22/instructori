import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import type { AuthUser } from './auth-types';

@Injectable()
export class AccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthUser }>();

    const user = req.user;
    if (!user?.userId) {
      throw new UnauthorizedException();
    }

    if (user.accessStatus === 'BLOCKED') {
      throw new ForbiddenException('Account is blocked');
    }

    if (user.role === 'ADMIN') {
      return true;
    }

    if (user.accessStatus !== 'ACTIVE') {
      throw new ForbiddenException('Access pending approval');
    }

    return true;
  }
}
