import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { AccessSource, AccessStatus, AuthUser } from '../dto/auth-types';
import { ACCESS_TOKEN_COOKIE } from '../auth_guard/auth-cookie';

type JwtPayload = {
  sub: string;
  email: string;
  fullName: string;
  role: AuthUser['role'];
  accessStatus?: AccessStatus;
  accessSource?: AccessSource | null;
};

function cookieExtractor(req: Request): string | null {
  const cookies = req.cookies as Record<string, unknown> | undefined;
  const token = cookies?.[ACCESS_TOKEN_COOKIE];
  return typeof token === 'string' ? token : null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload): AuthUser {
    return {
      userId: payload.sub,
      email: payload.email,
      fullName: payload.fullName,
      role: payload.role,
      accessStatus: payload.accessStatus ?? 'PENDING',
      accessSource: payload.accessSource ?? null,
    };
  }
}
