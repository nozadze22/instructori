import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

@Injectable()
export class InternalSecretGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const provided = req.header('x-notification-secret');
    const expected = this.config.get<string>('NOTIFICATION_INTERNAL_SECRET');

    if (!expected?.trim()) {
      throw new UnauthorizedException('Internal API not configured');
    }

    if (!provided || provided !== expected) {
      throw new UnauthorizedException('Invalid internal secret');
    }

    return true;
  }
}
