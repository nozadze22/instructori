import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../prisma/prisma.service';
import { ChatClientService } from '../../chat-client/chat-client.service';
import { EmailClientService } from '../../email-client/email-client.service';
import { NotificationClientService } from '../../notification-client/notification-client.service';
import { AuthService } from '../auth.service';
import type { AuthUser } from '../dto/auth-types';
import {
  AdminBroadcastEmailDto,
  AdminCreateDto,
  AdminLoginDto,
  BroadcastSystemMessageDto,
  UpdateUserAccessDto,
} from './admin.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthService,
    private readonly notifications: NotificationClientService,
    private readonly chatClient: ChatClientService,
    private readonly emailClient: EmailClientService,
    private readonly config: ConfigService,
  ) {}

  private appUrlForEmail(): string {
    const fromEnv = this.config.get<string>('FRONTEND_URL')?.trim();
    if (fromEnv) return fromEnv.replace(/\/$/, '');
    return 'https://www.instructorebi.com';
  }

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
    return this.auth.issueSession(this.auth.toAuthTokenUser(user), {
      replaceAllSessions: true,
    });
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

    return this.auth.issueSession(
      {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        accessStatus: user.accessStatus,
        accessSource: user.accessSource,
      },
      { replaceAllSessions: true },
    );
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

  async listEmailRecipients() {
    const users = await this.prisma.user.findMany({
      where: {
        role: { in: ['INSTRUCTOR', 'USER'] },
        accessStatus: { not: 'BLOCKED' },
      },
      orderBy: [{ role: 'asc' }, { fullName: 'asc' }],
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        accessStatus: true,
        profile: { select: { avatarUrl: true } },
      },
    });

    return {
      users: users.map((user) => ({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        accessStatus: user.accessStatus,
        avatarUrl: user.profile?.avatarUrl ?? null,
      })),
    };
  }

  async broadcastAdminEmail(dto: AdminBroadcastEmailDto) {
    const subject = dto.subject.trim();
    const body = dto.body.trim();
    if (!subject || !body) {
      throw new BadRequestException('Subject and body are required');
    }

    if (!this.emailClient.isEnabled()) {
      throw new BadRequestException(
        'Email queue is not configured (set EVENT_TRANSPORT=amqp and AMQP_URL)',
      );
    }

    const recipients = await this.resolveEmailRecipients(dto);
    if (recipients.length === 0) {
      throw new BadRequestException('No recipients match this audience');
    }

    const siteUrl = this.appUrlForEmail();

    await this.emailClient.queueAdminBroadcast({
      subject,
      body,
      siteUrl,
      recipients: recipients.map((user) => ({
        email: user.email,
        fullName: user.fullName,
      })),
    });

    return {
      ok: true,
      queued: true,
      recipientCount: recipients.length,
    };
  }

  private async resolveEmailRecipients(dto: AdminBroadcastEmailDto) {
    const baseWhere = {
      accessStatus: { not: 'BLOCKED' as const },
    };

    if (dto.audience === 'SELECTED') {
      if (!dto.userIds?.length) {
        throw new BadRequestException('userIds required for SELECTED audience');
      }
      const rows = await this.prisma.user.findMany({
        where: {
          ...baseWhere,
          id: { in: dto.userIds },
          role: { in: ['INSTRUCTOR', 'USER'] },
        },
        select: { id: true, email: true, fullName: true },
      });
      const byId = new Map(rows.map((row) => [row.id, row]));
      return dto.userIds
        .map((id) => byId.get(id))
        .filter((row): row is (typeof rows)[number] => !!row);
    }

    if (dto.audience === 'INSTRUCTORS') {
      return this.prisma.user.findMany({
        where: { ...baseWhere, role: 'INSTRUCTOR' },
        select: { id: true, email: true, fullName: true },
        orderBy: { fullName: 'asc' },
      });
    }

    if (dto.audience === 'USERS') {
      return this.prisma.user.findMany({
        where: { ...baseWhere, role: 'USER' },
        select: { id: true, email: true, fullName: true },
        orderBy: { fullName: 'asc' },
      });
    }

    return this.prisma.user.findMany({
      where: { ...baseWhere, role: { in: ['INSTRUCTOR', 'USER'] } },
      select: { id: true, email: true, fullName: true },
      orderBy: { fullName: 'asc' },
    });
  }

  async broadcastSystemMessage(admin: AuthUser, dto: BroadcastSystemMessageDto) {
    const title = dto.title.trim();
    const body = dto.body.trim();
    if (!title || !body) {
      throw new BadRequestException('Title and body are required');
    }

    const recipientRows = await this.prisma.user.findMany({
      where: { accessStatus: { not: 'BLOCKED' } },
      select: { id: true },
    });
    const recipientUserIds = recipientRows.map((row) => row.id);

    const inboxPromise = this.chatClient.publishSystemBroadcast({
      title,
      body,
      recipientUserIds,
    });
    const notifyPromise = this.notifications.publishSystemMessage({
      title,
      body,
      adminUserId: admin.userId,
    });
    const [inboxResult] = await Promise.all([inboxPromise, notifyPromise]);

    const recipientCount =
      inboxResult && typeof inboxResult === 'object' && 'recipientCount' in inboxResult
        ? inboxResult.recipientCount
        : recipientUserIds.length;

    return { ok: true, recipientCount };
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

    if (isActive) {
      void this.emailClient.sendAccessGranted({
        email: user.email,
        fullName: user.fullName,
      });
    }

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
