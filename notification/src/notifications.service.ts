import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from './prisma/prisma.service';
import type { InstructorReviewCreatedEvent } from './events/notification.events';
import { NotificationsRealtimeService } from './notifications-realtime.service';

const notificationSelect = {
  id: true,
  type: true,
  title: true,
  body: true,
  data: true,
  readAt: true,
  createdAt: true,
} satisfies Prisma.NotificationSelect;

type NotificationRow = Prisma.NotificationGetPayload<{
  select: typeof notificationSelect;
}>;

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: NotificationsRealtimeService,
  ) {}

  async createFromInstructorReview(event: InstructorReviewCreatedEvent) {
    const stars = '★'.repeat(Math.min(5, Math.max(1, event.rating)));
    const title = 'ახალი შეფასება';
    const bodyParts = [
      `${event.studentFullName} შეგაფასათ ${event.rating}/5 ${stars}.`,
    ];
    if (event.comment) {
      bodyParts.push(event.comment);
    }

    const row = await this.prisma.notification.create({
      data: {
        userId: event.instructorId,
        type: 'INSTRUCTOR_REVIEW',
        title,
        body: bodyParts.join('\n\n'),
        data: {
          reviewId: event.reviewId,
          studentId: event.studentId,
          rating: event.rating,
        },
      },
      select: notificationSelect,
    });

    const dto = this.toDto(row);
    await this.publishNew(event.instructorId, dto);
    return dto;
  }

  async createFromInstructorMessage(event: {
    messageId: string;
    instructorId: string;
    studentId: string;
    studentFullName: string;
    messagePreview: string;
  }) {
    const row = await this.prisma.notification.create({
      data: {
        userId: event.instructorId,
        type: 'INSTRUCTOR_MESSAGE',
        title: 'ახალი შეტყობინება',
        body: `${event.studentFullName}: ${event.messagePreview}`,
        data: {
          messageId: event.messageId,
          studentId: event.studentId,
        },
      },
      select: notificationSelect,
    });
    const dto = this.toDto(row);
    await this.publishNew(event.instructorId, dto);
    return dto;
  }

  async createFromInstructorRegistration(event: {
    userId: string;
    fullName: string;
    email: string;
    city: string;
    adminRecipientIds: string[];
  }) {
    await this.notifyRecipients(event.adminRecipientIds, {
      type: 'INSTRUCTOR_REGISTRATION',
      title: 'ახალი ინსტრუქტორი',
      body: `${event.fullName} (${event.city}) — ${event.email}. დაამტკიცე ანგარიში.`,
      data: {
        userId: event.userId,
        email: event.email,
        city: event.city,
      },
    });
    return { ok: true };
  }

  async createAccessPending(event: { userId: string; fullName: string }) {
    const row = await this.prisma.notification.create({
      data: {
        userId: event.userId,
        type: 'ACCESS_PENDING',
        title: 'ანგარიში მოლოდინშია',
        body: `${event.fullName}, თქვენი რეგისტრაცია მიღებულია. ადმინისტრატორი მალე დაამტკიცებს წვდომას.`,
        data: { kind: 'access_pending' },
      },
      select: notificationSelect,
    });
    const dto = this.toDto(row);
    await this.publishNew(event.userId, dto);
    return dto;
  }

  async createFromStudentLinked(event: {
    instructorId: string;
    studentId: string;
    studentFullName: string;
  }) {
    const row = await this.prisma.notification.create({
      data: {
        userId: event.instructorId,
        type: 'STUDENT_LINKED',
        title: 'ახალი სტუდენტი',
        body: `${event.studentFullName} შეუერთდა თქვენს ჯგუფს.`,
        data: { studentId: event.studentId },
      },
      select: notificationSelect,
    });
    const dto = this.toDto(row);
    await this.publishNew(event.instructorId, dto);
    return dto;
  }

  async createFromStudentRegistration(event: {
    studentId: string;
    studentFullName: string;
    instructorId?: string | null;
    adminRecipientIds: string[];
  }) {
    await this.notifyRecipients(event.adminRecipientIds, {
      type: 'STUDENT_REGISTRATION',
      title: 'ახალი სტუდენტი',
      body: `${event.studentFullName} დარეგისტრირდა.`,
      data: { studentId: event.studentId },
    });

    if (event.instructorId) {
      await this.createFromStudentLinked({
        instructorId: event.instructorId,
        studentId: event.studentId,
        studentFullName: event.studentFullName,
      });
    }

    return { ok: true };
  }

  async createFromSystemRoute(event: {
    routeId: string;
    title: string;
    city: string | null;
    action: 'created' | 'updated' | 'catalog_sync';
    createdCount?: number;
    updatedCount?: number;
    instructorRecipientIds: string[];
  }) {
    let title = 'მარშრუტის განახლება';
    let body = `«${event.title}»${event.city ? ` (${event.city})` : ''} განახლდა.`;

    if (event.action === 'created') {
      title = 'ახალი მარშრუტი';
      body = `«${event.title}»${event.city ? ` (${event.city})` : ''} დაემატა კატალოგში.`;
    } else if (event.action === 'catalog_sync') {
      title = 'საგამოცდო მარშრუტები განახლდა';
      body = `კატალოგი სინქრონდა: ${event.createdCount ?? 0} ახალი, ${event.updatedCount ?? 0} განახლება.`;
    }

    await this.notifyRecipients(event.instructorRecipientIds, {
      type: 'SYSTEM_ROUTE',
      title,
      body,
      data: {
        routeId: event.routeId,
        action: event.action,
        city: event.city,
      },
    });

    return { ok: true };
  }

  private async notifyRecipients(
    recipientUserIds: string[],
    payload: {
      type: Prisma.NotificationCreateManyInput['type'];
      title: string;
      body: string;
      data: Prisma.InputJsonValue;
    },
  ) {
    const uniqueIds = [...new Set(recipientUserIds.filter(Boolean))];
    if (!uniqueIds.length) {
      this.logger.warn(
        `No recipients for ${payload.type} notification — skipped`,
      );
      return;
    }

    await this.prisma.notification.createMany({
      data: uniqueIds.map((userId) => ({
        userId,
        type: payload.type,
        title: payload.title,
        body: payload.body,
        data: payload.data,
      })),
    });

    await Promise.all(uniqueIds.map((userId) => this.publishUnread(userId)));
  }

  async listForUser(
    userId: string,
    options: {
      filter?: 'all' | 'unread';
      page?: number;
      pageSize?: number;
    },
  ) {
    const page = Math.max(1, options.page ?? 1);
    const pageSize = Math.min(50, Math.max(1, options.pageSize ?? 20));
    const filter = options.filter ?? 'all';

    const where: Prisma.NotificationWhereInput = { userId };
    if (filter === 'unread') {
      where.readAt = null;
    }

    const [total, rows, unreadCount] = await this.prisma.$transaction([
      this.prisma.notification.count({ where }),
      this.prisma.notification.findMany({
        where,
        select: notificationSelect,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.notification.count({
        where: { userId, readAt: null },
      }),
    ]);

    return {
      items: rows.map((row) => this.toDto(row)),
      page,
      pageSize,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
      unreadCount,
    };
  }

  async unreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, readAt: null },
    });
    return { unreadCount: count };
  }

  async markRead(userId: string, id: string) {
    const row = await this.prisma.notification.findUnique({
      where: { id },
      select: { id: true, userId: true, readAt: true },
    });
    if (!row) {
      throw new NotFoundException('Notification not found');
    }
    if (row.userId !== userId) {
      throw new ForbiddenException();
    }
    if (row.readAt) {
      return { ok: true };
    }

    await this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });
    return { ok: true };
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    return { ok: true };
  }

  private toDto(row: NotificationRow) {
    return {
      id: row.id,
      type: row.type,
      title: row.title,
      body: row.body,
      data: row.data,
      readAt: row.readAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
    };
  }

  private async publishNew(
    userId: string,
    item: {
      id: string;
      type: string;
      title: string;
      body: string | null;
      data: unknown;
      readAt: string | null;
      createdAt: string;
    },
  ) {
    const { unreadCount } = await this.unreadCount(userId);
    this.realtime.emitNew(userId, item, unreadCount);
  }

  private async publishUnread(userId: string) {
    const { unreadCount } = await this.unreadCount(userId);
    this.realtime.emitUnread(userId, unreadCount);
  }
}
