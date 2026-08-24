import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { ChangePasswordDto, LoginDto, RegisterDto } from './dto/auth.dto';
import type { Role as PrismaRole } from '../../generated/prisma/enums';
import type {
  AccessSource,
  AccessStatus,
  AuthUser,
  Role,
} from './dto/auth-types';
import { refreshTokens } from './refresh-tokens';

export type AuthTokenUser = {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  accessStatus: AccessStatus;
  accessSource: AccessSource | null;
};

type DbAuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: PrismaRole;
  accessStatus: AccessStatus;
  accessSource: AccessSource | null;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        fullName: dto.fullName,
        passwordHash,
        role: 'INSTRUCTOR',
        accessStatus: 'PENDING',
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        accessStatus: true,
        accessSource: true,
      },
    });

    return this.issueSession(this.toAuthTokenUser(user));
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.trim().toLowerCase() },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        accessStatus: true,
        accessSource: true,
        passwordHash: true,
      },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    if (user.accessStatus === 'BLOCKED') {
      throw new UnauthorizedException('Account is blocked');
    }

    return this.issueSession(this.toAuthTokenUser(user));
  }

  async getMe(userId: string): Promise<AuthUser> {
    const user = await this.requireActiveUser(userId);
    return this.toAuthUser(user);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException(
        'New password must be different from the current password',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true, accessStatus: true },
    });
    if (!user) throw new UnauthorizedException('User not found');

    if (user.accessStatus === 'BLOCKED') {
      throw new UnauthorizedException('Account is blocked');
    }

    const ok = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!ok) {
      throw new BadRequestException('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { passwordHash },
      });
      await refreshTokens(tx).deleteMany({ where: { userId } });
    });

    return { ok: true };
  }

  async issueSession(user: AuthTokenUser): Promise<AuthSession> {
    const accessExpiresIn =
      this.config.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m';
    const accessToken = this.jwt.sign(
      {
        sub: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        accessStatus: user.accessStatus,
        accessSource: user.accessSource,
      },
      { expiresIn: accessExpiresIn as `${number}m` },
    );

    const refreshToken = randomBytes(48).toString('base64url');
    const tokenHash = this.hashRefreshToken(refreshToken);

    await refreshTokens(this.prisma).create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
      user: this.toAuthUser(user),
    };
  }

  async refreshSession(refreshToken: string | null): Promise<AuthSession> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const tokenHash = this.hashRefreshToken(refreshToken);
    const stored = await refreshTokens(this.prisma).findUnique({
      where: { tokenHash },
    });

    if (!stored || stored.expiresAt.getTime() <= Date.now()) {
      if (stored) {
        await refreshTokens(this.prisma).delete({ where: { id: stored.id } });
      }
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.requireActiveUser(stored.userId);

    await refreshTokens(this.prisma).delete({ where: { id: stored.id } });

    return this.issueSession(user);
  }

  async logout(refreshToken: string | null) {
    if (refreshToken) {
      const tokenHash = this.hashRefreshToken(refreshToken);
      await refreshTokens(this.prisma).deleteMany({ where: { tokenHash } });
    }
    return { ok: true };
  }

  private async requireActiveUser(userId: string): Promise<AuthTokenUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        accessStatus: true,
        accessSource: true,
      },
    });
    if (!user) throw new UnauthorizedException('User not found');

    if (user.accessStatus === 'BLOCKED') {
      await refreshTokens(this.prisma).deleteMany({ where: { userId } });
      throw new UnauthorizedException('Account is blocked');
    }

    return this.toAuthTokenUser(user);
  }

  toAuthTokenUser(user: DbAuthUser): AuthTokenUser {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role === 'USER' ? 'INSTRUCTOR' : user.role,
      accessStatus: user.accessStatus,
      accessSource: user.accessSource,
    };
  }

  private hashRefreshToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private toAuthUser(user: AuthTokenUser): AuthUser {
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
