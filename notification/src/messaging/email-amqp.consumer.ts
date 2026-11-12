import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AmqpConsumer, EMAIL_QUEUE } from '@instructor/messaging';
import { EmailDispatchService } from '../email/email-dispatch.service';
import { resolveAmqpUrl } from './amqp-url';

@Injectable()
export class EmailAmqpConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EmailAmqpConsumer.name);
  private consumer: AmqpConsumer | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly dispatch: EmailDispatchService,
  ) {}

  async onModuleInit(): Promise<void> {
    const url = resolveAmqpUrl(this.config);
    const disabled =
      this.config.get<string>('AMQP_CONSUMER_ENABLED')?.trim() === '0';
    if (!url || disabled) {
      this.logger.log(
        'Email AMQP consumer disabled (AMQP_URL / RABBITMQ_URL + consumer enabled)',
      );
      return;
    }

    this.consumer = new AmqpConsumer({
      url,
      queue: EMAIL_QUEUE,
      prefetch: 5,
      onMessage: (routingKey, payload) =>
        this.dispatch.dispatch(routingKey, payload as Record<string, unknown>),
    });

    try {
      await this.consumer.start();
      this.logger.log(`Email AMQP consumer listening on ${EMAIL_QUEUE}`);
    } catch (error) {
      this.logger.error(
        `Email AMQP consumer failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      this.consumer = null;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.consumer?.close();
    this.consumer = null;
  }
}
