import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { PrismaService } from '../../../prisma/prisma.service';
import { toAuthRole, type AuthUser, type Role } from '../dto/auth-types';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required?.length) return true;

    const req = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthUser }>();
    if (!req.user?.userId) return false;

    const dbUser = await this.prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { role: true },
    });
    const role = toAuthRole(dbUser?.role ?? req.user.role);

    return required.includes(role);
  }
}