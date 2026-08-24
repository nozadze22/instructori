import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuthService } from '../auth.service';
import {
  AdminCreateDto,
  AdminLoginDto,
  UpdateUserAccessDto,
} from './admin.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthService,
  ) {}

  async getSetupStatus() {
    const adminCount = await this.prisma.user.count({
      where: { role: 'ADMIN' },
    });
    return { needsSetup: adminCount === 0 };
  }

  async adminSetup(dto: AdminCreateDto) {
    const { needsSetup } = await this.getSetupStatus();
    if (!needsSetup) {
      throw new ForbiddenException('Admin already exists');
    }
    const user = await this.createAdminUser(dto);
    return this.auth.issueSession(this.auth.toAuthTokenUser(user));
  }

  async adminCreate(dto: AdminCreateDto) {
    const user = await this.createAdminUser(dto);
    return {
      user: {
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        accessStatus: user.accessStatus,
        accessSource: user.accessSource,
      },
    };
  }

  async adminLogin(dto: AdminLoginDto) {
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

    if (!user || user.role !== 'ADMIN') {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.accessStatus === 'BLOCKED') {
      throw new UnauthorizedException('Account is blocked');
    }

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    return this.auth.issueSession({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      accessStatus: user.accessStatus,
      accessSource: user.accessSource,
    });
  }

  async listUsers() {
    const users = await this.prisma.user.findMany({
      where: { role: 'INSTRUCTOR' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        accessStatus: true,
        accessSource: true,
        accessGrantedAt: true,
        createdAt: true,
      },
    });

    return { users };
  }

  async updateUserAccess(userId: string, dto: UpdateUserAccessDto) {
    const existing = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('User not found');

    const accessStatus = dto.accessStatus;
    const isActive = accessStatus === 'ACTIVE';

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        accessStatus,
        accessSource: isActive ? (dto.accessSource ?? 'ADMIN') : null,
        accessGrantedAt: isActive ? new Date() : null,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        accessStatus: true,
        accessSource: true,
        accessGrantedAt: true,
        createdAt: true,
      },
    });

    return { user };
  }

  private async createAdminUser(dto: AdminCreateDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const now = new Date();

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        fullName: dto.fullName?.trim() || 'Admin',
        passwordHash,
        role: 'ADMIN',
        accessStatus: 'ACTIVE',
        accessSource: 'ADMIN',
        accessGrantedAt: now,
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

    return user;
  }
}
