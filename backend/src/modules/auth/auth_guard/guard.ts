import {
    CanActivate,
    ExecutionContext,
    Injectable,
  } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  import type { Request } from 'express';
  import type { AuthUser, Role } from '../dto/auth-types';
  import { ROLES_KEY } from './roles.decorator';
  
  @Injectable()
  export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}
  
    canActivate(context: ExecutionContext): boolean {
      const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
      if (!required?.length) return true;
  
      const req = context.switchToHttp().getRequest<Request & { user?: AuthUser }>();
      return !!req.user && required.includes(req.user.role);
    }
  }