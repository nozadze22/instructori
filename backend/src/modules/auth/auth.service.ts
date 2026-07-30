import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { ChangePasswordDto, LoginDto, RegisterDto } from './dto/auth.dto';
import type { AccessSource, AccessStatus, AuthUser, Role } from './dto/auth-types';

type AuthTokenUser = {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  accessStatus: AccessStatus;
  accessSource: AccessSource | null;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
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

    return this.signToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
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

    return this.signToken({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      accessStatus: user.accessStatus,
      accessSource: user.accessSource,
    });
  }

  async getMe(userId: string): Promise<AuthUser> {
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
      throw new UnauthorizedException('Account is blocked');
    }

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
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { ok: true };
  }

  private signToken(user: AuthTokenUser) {
    const authUser = this.toAuthUser(user);

    return {
      accessToken: this.jwt.sign({
        sub: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        accessStatus: user.accessStatus,
        accessSource: user.accessSource,
      }),
      user: authUser,
    };
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
