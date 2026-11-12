import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventPublisherService } from '../messaging/event-publisher.service';

export type SendEmailPayload = {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

@Injectable()
export class EmailClientService {
  private readonly logger = new Logger(EmailClientService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly events: EventPublisherService,
  ) {}

  isEnabled(): boolean {
    return this.events.shouldPublishAmqp();
  }

  async sendRaw(payload: SendEmailPayload): Promise<void> {
    await this.publish('send', payload);
  }

  async queueAdminBroadcast(payload: {
    subject: string;
    body: string;
    siteUrl: string;
    recipients: Array<{ email: string; fullName: string }>;
  }): Promise<void> {
    await this.publish('admin-broadcast', payload);
  }

  async sendAccessPending(user: {
    email: string;
    fullName: string;
  }): Promise<void> {
    await this.publish('access-pending', {
      to: user.email,
      fullName: user.fullName,
    });
  }

  async sendAccessGranted(user: {
    email: string;
    fullName: string;
  }): Promise<void> {
    await this.publish('access-granted', {
      to: user.email,
      fullName: user.fullName,
    });
  }

  async sendContactAdmin(contact: {
    fullName: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<void> {
    const inbox =
      this.config.get<string>('CONTACT_INBOX_EMAIL')?.trim() ||
      this.config.get<string>('ADMIN_NOTIFY_EMAIL')?.trim();
    if (!inbox) {
      this.logger.debug(
        'CONTACT_INBOX_EMAIL unset — skipping contact admin email',
      );
      return;
    }

    await this.publish('contact-admin', {
      to: inbox,
      ...contact,
    });
  }

  private async publish(
    path:
      | 'send'
      | 'access-pending'
      | 'access-granted'
      | 'contact-admin'
      | 'admin-broadcast',
    body: unknown,
  ): Promise<void> {
    if (!this.isEnabled()) {
      this.logger.debug(`Email skipped (${path}) — EVENT_TRANSPORT is not AMQP`);
      return;
    }
    await this.events.publishEmail(path, body);
  }
}
