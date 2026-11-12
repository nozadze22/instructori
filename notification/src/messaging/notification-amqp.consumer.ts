import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AmqpConsumer,
  notificationRoutingKey,
  NOTIFICATION_QUEUE,
  type NotificationEventPath,
} from '../lib/messaging/index.js';
import { NotificationsService } from '../notifications.service';
import { resolveAmqpUrl } from './amqp-url';

const PATHS: NotificationEventPath[] = [
  'instructor-review-created',
  'instructor-message-created',
  'instructor-registration',
  'access-pending',
  'student-linked',
  'student-registration',
  'system-route',
  'system-message',
];

@Injectable()
export class NotificationAmqpConsumer
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(NotificationAmqpConsumer.name);
  private consumer: AmqpConsumer | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly notifications: NotificationsService,
  ) {}

  async onModuleInit(): Promise<void> {
    const url = resolveAmqpUrl(this.config);
    const disabled =
      this.config.get<string>('AMQP_CONSUMER_ENABLED')?.trim() === '0';
    if (!url || disabled) {
      this.logger.log(
        'AMQP consumer disabled (set AMQP_URL and AMQP_CONSUMER_ENABLED≠0)',
      );
      return;
    }

    this.consumer = new AmqpConsumer({
      url,
      queue: NOTIFICATION_QUEUE,
      onMessage: (routingKey, payload) =>
        this.dispatch(routingKey, payload as Record<string, unknown>),
    });

    try {
      await this.consumer.start();
      this.logger.log(`AMQP consumer listening on ${NOTIFICATION_QUEUE}`);
    } catch (error) {
      this.logger.error(
        `AMQP consumer failed to start: ${error instanceof Error ? error.message : String(error)}`,
      );
      this.consumer = null;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.consumer?.close();
    this.consumer = null;
  }

  private async dispatch(
    routingKey: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const path = this.routingKeyToPath(routingKey);
    if (!path) {
      this.logger.warn(`Unknown routing key: ${routingKey}`);
      return;
    }

    switch (path) {
      case 'instructor-review-created':
        await this.notifications.createFromInstructorReview({
          reviewId: String(payload.reviewId),
          instructorId: String(payload.instructorId),
          studentId: String(payload.studentId),
          studentFullName: String(payload.studentFullName),
          rating: Number(payload.rating),
          comment: (payload.comment as string | null | undefined) ?? null,
        });
        return;
      case 'instructor-message-created':
        await this.notifications.createFromInstructorMessage({
          messageId: String(payload.messageId),
          instructorId: String(payload.instructorId),
          studentId: String(payload.studentId),
          studentFullName: String(payload.studentFullName),
          messagePreview: String(payload.messagePreview),
        });
        return;
      case 'instructor-registration':
        await this.notifications.createFromInstructorRegistration({
          userId: String(payload.userId),
          fullName: String(payload.fullName),
          email: String(payload.email),
          city: String(payload.city),
          adminRecipientIds: (payload.adminRecipientIds as string[]) ?? [],
        });
        return;
      case 'access-pending':
        await this.notifications.createAccessPending({
          userId: String(payload.userId),
          fullName: String(payload.fullName),
        });
        return;
      case 'student-linked':
        await this.notifications.createFromStudentLinked({
          instructorId: String(payload.instructorId),
          studentId: String(payload.studentId),
          studentFullName: String(payload.studentFullName),
        });
        return;
      case 'student-registration':
        await this.notifications.createFromStudentRegistration({
          studentId: String(payload.studentId),
          studentFullName: String(payload.studentFullName),
          instructorId: (payload.instructorId as string | null | undefined) ?? null,
          adminRecipientIds: (payload.adminRecipientIds as string[]) ?? [],
        });
        return;
      case 'system-route':
        await this.notifications.createFromSystemRoute({
          routeId: String(payload.routeId),
          title: String(payload.title),
          city: (payload.city as string | null | undefined) ?? null,
          action: payload.action as 'created' | 'updated' | 'catalog_sync',
          createdCount: payload.createdCount as number | undefined,
          updatedCount: payload.updatedCount as number | undefined,
          instructorRecipientIds:
            (payload.instructorRecipientIds as string[]) ?? [],
        });
        return;
      case 'system-message':
        await this.notifications.createFromSystemMessage({
          title: String(payload.title),
          body: String(payload.body),
          adminUserId: String(payload.adminUserId),
          recipientUserIds: (payload.recipientUserIds as string[]) ?? [],
        });
        return;
      default:
        return;
    }
  }

  private routingKeyToPath(routingKey: string): NotificationEventPath | null {
    for (const path of PATHS) {
      if (routingKey === notificationRoutingKey(path)) {
        return path;
      }
    }
    return null;
  }
}
