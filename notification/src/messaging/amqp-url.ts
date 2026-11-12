import type { ConfigService } from '@nestjs/config';

/** Supports AMQP_URL or legacy RABBITMQ_URL in .env */
export function resolveAmqpUrl(config: ConfigService): string | undefined {
  return (
    config.get<string>('AMQP_URL')?.trim() ||
    config.get<string>('RABBITMQ_URL')?.trim() ||
    undefined
  );
}
