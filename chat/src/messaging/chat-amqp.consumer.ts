import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AmqpConsumer, CHAT_QUEUE, chatRoutingKey } from '../lib/messaging/index.js';
import { SystemInboxService } from '../system-inbox.service';

@Injectable()
export class ChatAmqpConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ChatAmqpConsumer.name);
  private consumer: AmqpConsumer | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly systemInbox: SystemInboxService,
  ) {}

  async onModuleInit(): Promise<void> {
    const url = this.config.get<string>('AMQP_URL')?.trim();
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
      queue: CHAT_QUEUE,
      onMessage: (routingKey, payload) =>
        this.dispatch(routingKey, payload as Record<string, unknown>),
    });

    try {
      await this.consumer.start();
      this.logger.log(`AMQP consumer listening on ${CHAT_QUEUE}`);
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
    if (routingKey !== chatRoutingKey('system-broadcast')) {
      this.logger.warn(`Unknown routing key: ${routingKey}`);
      return;
    }

    await this.systemInbox.fanOutFromBroadcast(
      String(payload.title),
      String(payload.body),
      (payload.recipientUserIds as string[]) ?? [],
    );
  }
}
