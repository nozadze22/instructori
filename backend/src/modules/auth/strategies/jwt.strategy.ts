import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../prisma/prisma.service';
import type { AccessSource, AccessStatus, AuthUser } from '../dto/auth-types';
import { ACCESS_TOKEN_COOKIE } from '../auth_guard/auth-cookie';

type JwtPayload = {
  sub: string;
  email: string;
  fullName: string;
  role: AuthUser['role'];
  accessStatus?: AccessStatus;
  accessSource?: AccessSource | null;
  sv?: number;
};

function cookieExtractor(req: Request): string | null {
  const cookies = req.cookies as Record<string, unknown> | undefined;
  const token = cookies?.[ACCESS_TOKEN_COOKIE];
  return typeof token === 'string' ? token : null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        accessStatus: true,
        accessSource: true,
        sessionVersion: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const tokenVersion = payload.sv ?? 0;
    if (tokenVersion !== user.sessionVersion) {
      throw new UnauthorizedException('Logged in on another device');
    }

    if (user.accessStatus === 'BLOCKED') {
      throw new UnauthorizedException('Account is blocked');
    }

    return {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role === 'USER' ? 'INSTRUCTOR' : user.role,
      accessStatus: user.accessStatus,
      accessSource: user.accessSource,
    };
  }
}
