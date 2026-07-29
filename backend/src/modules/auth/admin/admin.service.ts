import {
    ConflictException,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  import * as bcrypt from 'bcrypt';
  import { PrismaService } from '../../../prisma/prisma.service';
  import type { AuthUser, Role } from '../dto/auth-types';
  import { AdminCreateDto, AdminLoginDto } from './admin.dto';
  
  type AuthTokenUser = {
    id: string;
    email: string;
    fullName: string;
    role: Role;
  };
  
  type LoginUser = AuthTokenUser & { passwordHash: string };
  
  type UserDelegate = {
    findUnique: (args: {
      where: { email: string };
      select?: {
        id?: true;
        email?: true;
        fullName?: true;
        role?: true;
        passwordHash?: true;
      };
    }) => Promise<LoginUser | null>;
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
  export class AdminService {
    constructor(
      private readonly prisma: PrismaService & { user: UserDelegate },
      private readonly jwt: JwtService,
    ) {}
  
    async adminCreate(dto: AdminCreateDto) {
      const exists = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (exists) throw new ConflictException('Email already registered');
  
      const passwordHash = await bcrypt.hash(dto.password, 10);
  
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          fullName: 'Admin',
          passwordHash,
          role: 'ADMIN',
        },
        select: { id: true, email: true, fullName: true, role: true },
      });

      return this.signToken(user);
    }

    async adminLogin(dto: AdminLoginDto) {
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
  
      if (!user || user.role !== 'ADMIN') {
        throw new UnauthorizedException('Invalid credentials');
      }
  
      const ok = await bcrypt.compare(dto.password, user.passwordHash);
      if (!ok) throw new UnauthorizedException('Invalid credentials');
  
      return this.signToken(user);
    }
  
    private signToken(user: AuthTokenUser) {
      return {
        accessToken: this.jwt.sign({
          sub: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        }),
        user: {
          userId: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        } satisfies AuthUser,
      };
    }
  }