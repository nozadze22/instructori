import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthUser } from './auth-types';
import { readAccessToken } from './auth-cookie';

type JwtPayload = {
  sub: string;
  email: string;
  fullName: string;
  role: AuthUser['role'];
  accessStatus?: AuthUser['accessStatus'];
  accessSource?: AuthUser['accessSource'] | null;
  sv?: number;
  purpose?: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        readAccessToken,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    if (payload.purpose) {
      throw new UnauthorizedException('Invalid token');
    }

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
      role: user.role,
      accessStatus: user.accessStatus,
      accessSource: user.accessSource,
    };
  }
}
