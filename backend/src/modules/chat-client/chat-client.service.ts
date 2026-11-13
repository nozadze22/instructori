import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventPublisherService } from '../messaging/event-publisher.service';

@Injectable()
export class ChatClientService {
  private readonly logger = new Logger(ChatClientService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly eventPublisher: EventPublisherService,
  ) {}

  publishSystemBroadcast(payload: {
    title: string;
    body: string;
    recipientUserIds: string[];
  }): Promise<{ recipientCount: number } | void> {
    return this.post('system-broadcast', payload);
  }

  seedDirectMessage(payload: {
    senderId: string;
    recipientId: string;
    body: string;
  }): void {
    void this.post('seed-direct-message', payload);
  }

  private async post(
    path: string,
    body: unknown,
  ): Promise<{ recipientCount: number } | void> {
    if (path === 'system-broadcast' || path === 'seed-direct-message') {
      await this.eventPublisher.publishChat(
        path,
        body,
      );
    }

    if (!this.eventPublisher.shouldPublishHttp()) {
      return;
    }

    const baseUrl = this.config.get<string>('CHAT_SERVICE_URL')?.trim();
    const secret = this.config.get<string>('CHAT_INTERNAL_SECRET')?.trim();

    if (!baseUrl) {
      this.logger.debug(
        'CHAT_SERVICE_URL unset — skipping chat HTTP publish',
      );
      return;
    }

    if (!secret) {
      this.logger.warn(
        'CHAT_INTERNAL_SECRET unset — cannot call chat service',
      );
      return;
    }

    const url = `${baseUrl.replace(/\/$/, '')}/internal/events/${path}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Chat-Secret': secret,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        const hint =
          response.status === 401
            ? ' — check CHAT_INTERNAL_SECRET matches on backend and chat service'
            : '';
        this.logger.warn(
          `Chat service returned ${response.status}: ${text.slice(0, 200)}${hint}`,
        );
        return;
      }

      return (await response.json()) as { recipientCount: number };
    } catch (error) {
      this.logger.warn(
        `Chat publish failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
