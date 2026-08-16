import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../../../prisma/prisma.service';
import type { AuthUser } from '../dto/auth-types';

@Injectable()
export class AccessGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthUser }>();

    if (!req.user?.userId) {
      throw new UnauthorizedException();
    }

    const user = await this.prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { accessStatus: true, role: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
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
