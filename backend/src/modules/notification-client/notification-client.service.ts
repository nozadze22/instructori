import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import type {
  NotificationRouteEvents,
  SystemRoutePayload,
} from './notification-client.types';

export type { SystemRoutePayload } from './notification-client.types';

export type InstructorReviewCreatedPayload = {
  reviewId: string;
  instructorId: string;
  studentId: string;
  studentFullName: string;
  rating: number;
  comment: string | null;
};

export type InstructorMessageCreatedPayload = {
  messageId: string;
  instructorId: string;
  studentId: string;
  studentFullName: string;
  messagePreview: string;
};

export type InstructorRegistrationPayload = {
  userId: string;
  fullName: string;
  email: string;
  city: string;
};

export type AccessPendingPayload = {
  userId: string;
  fullName: string;
};

export type StudentLinkedPayload = {
  instructorId: string;
  studentId: string;
  studentFullName: string;
};

export type StudentRegistrationPayload = {
  studentId: string;
  studentFullName: string;
  instructorId?: string | null;
};

@Injectable()
export class NotificationClientService implements NotificationRouteEvents {
  private readonly logger = new Logger(NotificationClientService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  publishInstructorReviewCreated(
    payload: InstructorReviewCreatedPayload,
  ): void {
    void this.post('instructor-review-created', payload);
  }

  publishInstructorMessageCreated(
    payload: InstructorMessageCreatedPayload,
  ): void {
    void this.post('instructor-message-created', payload);
  }

  publishInstructorRegistration(payload: InstructorRegistrationPayload): void {
    void this.publishInstructorRegistrationAsync(payload);
  }

  publishAccessPending(payload: AccessPendingPayload): void {
    void this.post('access-pending', payload);
  }

  publishStudentLinked(payload: StudentLinkedPayload): void {
    void this.post('student-linked', payload);
  }

  publishStudentRegistration(payload: StudentRegistrationPayload): void {
    void this.publishStudentRegistrationAsync(payload);
  }

  publishSystemRoute(payload: SystemRoutePayload): void {
    void this.publishSystemRouteAsync(payload);
  }

  publishSystemMessage(payload: {
    title: string;
    body: string;
    adminUserId: string;
  }): Promise<void> {
    return this.publishSystemMessageAsync(payload);
  }

  private async publishInstructorRegistrationAsync(
    payload: InstructorRegistrationPayload,
  ): Promise<void> {
    const adminRecipientIds = await this.listAdminUserIds();
    await this.post('instructor-registration', {
      ...payload,
      adminRecipientIds,
    });
  }

  private async publishStudentRegistrationAsync(
    payload: StudentRegistrationPayload,
  ): Promise<void> {
    const adminRecipientIds = await this.listAdminUserIds();
    await this.post('student-registration', {
      ...payload,
      adminRecipientIds,
    });
  }

  private async publishSystemRouteAsync(
    payload: SystemRoutePayload,
  ): Promise<void> {
    const instructorRecipientIds = await this.listActiveInstructorUserIds();
    await this.post('system-route', {
      ...payload,
      instructorRecipientIds,
    });
  }

  private async publishSystemMessageAsync(payload: {
    title: string;
    body: string;
    adminUserId: string;
  }): Promise<void> {
    const recipientUserIds = await this.listBroadcastUserIds();
    await this.post('system-message', {
      title: payload.title,
      body: payload.body,
      adminUserId: payload.adminUserId,
      recipientUserIds,
    });
  }

  private async listBroadcastUserIds(): Promise<string[]> {
    const rows = await this.prisma.user.findMany({
      where: { accessStatus: { not: 'BLOCKED' } },
      select: { id: true },
    });
    return rows.map((row) => row.id);
  }

  private async listAdminUserIds(): Promise<string[]> {
    const rows = await this.prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });
    return rows.map((row) => row.id);
  }

  private async listActiveInstructorUserIds(): Promise<string[]> {
    const rows = await this.prisma.user.findMany({
      where: { role: 'INSTRUCTOR', accessStatus: 'ACTIVE' },
      select: { id: true },
    });
    return rows.map((row) => row.id);
  }

  private async post(path: string, body: unknown): Promise<void> {
    const baseUrl = this.config.get<string>('NOTIFICATION_SERVICE_URL')?.trim();
    const secret = this.config
      .get<string>('NOTIFICATION_INTERNAL_SECRET')
      ?.trim();

    if (!baseUrl) {
      this.logger.debug(
        'NOTIFICATION_SERVICE_URL unset — skipping notification publish',
      );
      return;
    }

    if (!secret) {
      this.logger.warn(
        'NOTIFICATION_INTERNAL_SECRET unset — cannot call notification service',
      );
      return;
    }

    const url = `${baseUrl.replace(/\/$/, '')}/internal/events/${path}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Notification-Secret': secret,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        const hint =
          response.status === 401
            ? ' — check NOTIFICATION_INTERNAL_SECRET matches on backend and notification service'
            : '';
        this.logger.warn(
          `Notification service returned ${response.status}: ${text.slice(0, 200)}${hint}`,
        );
      }
    } catch (error) {
      this.logger.warn(
        `Notification publish failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
