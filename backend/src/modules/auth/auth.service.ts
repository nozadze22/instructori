import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import type { AuthUser, Role } from './dto/auth-types';

type AuthTokenUser = {
  id: string;
  email: string;
  fullName: string;
  role: Role;
};

type LoginUser = AuthTokenUser & {
  passwordHash: string;
};

type UserDelegate = {
  findUnique: {
    (args: {
      where: { email?: string; id?: string };
      select: {
        id: true;
        email: true;
        fullName: true;
        role: true;
        passwordHash: true;
      };
    }): Promise<LoginUser | null>;
    (args: {
      where: { email?: string; id?: string };
      select: {
        id: true;
        email: true;
        fullName: true;
        role: true;
      };
    }): Promise<AuthTokenUser | null>;
    (args: {
      where: { email?: string; id?: string };
    }): Promise<LoginUser | null>;
  };
  create: (args: {
    data: {
      email: string;
      fullName: string;
      passwordHash: string;
      role: Role;
    };
    select: {
      id: true;
      email: true;
      fullName: true;
      role: true;
    };
  }) => Promise<AuthTokenUser>;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService & { user: UserDelegate },
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
      },
      select: { id: true, email: true, fullName: true, role: true },
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
        passwordHash: true,
      },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    return this.signToken({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
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
      },
    });
    if (!user) throw new UnauthorizedException('User not found');

    return {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };
  }

  private signToken(user: AuthTokenUser) {
    const payload = {
      sub: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };

    return {
      accessToken: this.jwt.sign(payload),
      user: {
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      } satisfies AuthUser,
    };
  }
}
