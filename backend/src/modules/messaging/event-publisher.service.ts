import {
  Injectable,
  Logger,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AmqpPublisher,
  chatRoutingKey,
  emailRoutingKey,
  notificationRoutingKey,
  parseEventTransport,
  type ChatEventPath,
  type EmailEventPath,
  type EventTransport,
  type NotificationEventPath,
} from '../../lib/messaging/index.js';

@Injectable()
export class EventPublisherService implements OnModuleDestroy {
  private readonly logger = new Logger(EventPublisherService.name);
  private publisher: AmqpPublisher | null = null;

  constructor(private readonly config: ConfigService) {}

  getTransport(): EventTransport {
    const amqpUrl = this.amqpUrl();
    if (!amqpUrl) {
      return 'http';
    }
    const configured = this.config.get<string>('EVENT_TRANSPORT')?.trim();
    if (!configured) {
      return 'amqp';
    }
    return parseEventTransport(configured);
  }

  shouldPublishAmqp(): boolean {
    const mode = this.getTransport();
    return Boolean(this.amqpUrl()) && (mode === 'amqp' || mode === 'dual');
  }

  shouldPublishHttp(): boolean {
    const mode = this.getTransport();
    return mode === 'http' || mode === 'dual' || !this.amqpUrl();
  }

  async publishNotification(
    path: NotificationEventPath,
    body: unknown,
  ): Promise<void> {
    if (!this.shouldPublishAmqp()) {
      return;
    }
    await this.publishAmqp(notificationRoutingKey(path), body);
  }

  async publishChat(path: ChatEventPath, body: unknown): Promise<void> {
    if (!this.shouldPublishAmqp()) {
      return;
    }
    await this.publishAmqp(chatRoutingKey(path), body);
  }

  async publishEmail(path: EmailEventPath, body: unknown): Promise<void> {
    if (!this.shouldPublishAmqp()) {
      return;
    }
    await this.publishAmqp(emailRoutingKey(path), body);
  }

  async onModuleDestroy(): Promise<void> {
    await this.publisher?.close();
    this.publisher = null;
  }

  private async publishAmqp(
    routingKey: string,
    body: unknown,
  ): Promise<void> {
    const url = this.amqpUrl();
    if (!url) {
      return;
    }

    try {
      const publisher = this.getPublisher(url);
      await publisher.publish(routingKey, body);
    } catch (error) {
      this.logger.warn(
        `AMQP publish failed (${routingKey}): ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private getPublisher(url: string): AmqpPublisher {
    if (!this.publisher) {
      this.publisher = new AmqpPublisher({ url });
    }
    return this.publisher;
  }

  private amqpUrl(): string | undefined {
    return this.config.get<string>('AMQP_URL')?.trim() || undefined;
  }
}
