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

  async getStats() {
    const since = new Date();
    since.setDate(since.getDate() - 6);
    since.setHours(0, 0, 0, 0);

    const [
      totalInstructors,
      activeInstructors,
      pendingInstructors,
      blockedInstructors,
      totalRoutes,
      publishedRoutes,
      systemRoutes,
      routesWithVoice,
      recentInstructors,
      routes,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: 'INSTRUCTOR' } }),
      this.prisma.user.count({
        where: { role: 'INSTRUCTOR', accessStatus: 'ACTIVE' },
      }),
      this.prisma.user.count({
        where: { role: 'INSTRUCTOR', accessStatus: 'PENDING' },
      }),
      this.prisma.user.count({
        where: { role: 'INSTRUCTOR', accessStatus: 'BLOCKED' },
      }),
      this.prisma.route.count(),
      this.prisma.route.count({ where: { isPublished: true } }),
      this.prisma.route.count({ where: { visibility: 'SYSTEM' } }),
      this.prisma.route.count({
        where: { steps: { some: {} } },
      }),
      this.prisma.user.findMany({
        where: { role: 'INSTRUCTOR', createdAt: { gte: since } },
        select: { createdAt: true },
      }),
      this.prisma.route.findMany({
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          title: true,
          city: true,
          isPublished: true,
          visibility: true,
          sourceKey: true,
          path: true,
          updatedAt: true,
          _count: { select: { steps: true } },
        },
      }),
    ]);

    const dayKeys: string[] = [];
    for (let i = 0; i < 7; i += 1) {
      const day = new Date(since);
      day.setDate(since.getDate() + i);
      dayKeys.push(day.toISOString().slice(0, 10));
    }

    const countsByDay = Object.fromEntries(dayKeys.map((key) => [key, 0]));
    for (const user of recentInstructors) {
      const key = user.createdAt.toISOString().slice(0, 10);
      if (key in countsByDay) countsByDay[key] += 1;
    }

    return {
      users: {
        total: totalInstructors,
        active: activeInstructors,
        pending: pendingInstructors,
        blocked: blockedInstructors,
      },
      routes: {
        total: totalRoutes,
        published: publishedRoutes,
        system: systemRoutes,
        withVoice: routesWithVoice,
      },
      registrationsByDay: dayKeys.map((date) => ({
        date,
        count: countsByDay[date] ?? 0,
      })),
      routesList: routes.map((route) => ({
        id: route.id,
        title: route.title,
        city: route.city,
        isPublished: route.isPublished,
        visibility: route.visibility,
        sourceKey: route.sourceKey,
        stepsCount: route._count.steps,
        pathPoints: Array.isArray(route.path) ? route.path.length : 0,
        updatedAt: route.updatedAt.toISOString(),
      })),
    };
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
