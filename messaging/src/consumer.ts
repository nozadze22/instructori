import { connect, type Channel, type ConsumeMessage } from 'amqplib';

type AmqpConnection = Awaited<ReturnType<typeof connect>>;
import { assertInstructorEventTopology } from './topology.js';
import { parseEnvelope } from './envelope.js';

export type AmqpMessageHandler = (
  routingKey: string,
  payload: unknown,
  meta: { eventId: string; publishedAt: string },
) => Promise<void>;

export type AmqpConsumerOptions = {
  url: string;
  queue: string;
  prefetch?: number;
  onMessage: AmqpMessageHandler;
};

export class AmqpConsumer {
  private connection: AmqpConnection | null = null;
  private channel: Channel | null = null;
  private consumerTag: string | null = null;

  constructor(private readonly options: AmqpConsumerOptions) {}

  async start(): Promise<void> {
    if (this.channel) {
      return;
    }

    const connection = await connect(this.options.url);
    const channel = await connection.createChannel();
    await assertInstructorEventTopology(channel);

    const prefetch = this.options.prefetch ?? 10;
    await channel.prefetch(prefetch);

    const { consumerTag } = await channel.consume(
      this.options.queue,
      (message) => {
        void this.handleMessage(channel, message);
      },
      { noAck: false },
    );

    connection.on('error', () => {
      void this.close();
    });
    connection.on('close', () => {
      this.channel = null;
      this.connection = null;
      this.consumerTag = null;
    });

    this.connection = connection;
    this.channel = channel;
    this.consumerTag = consumerTag;
  }

  async close(): Promise<void> {
    const channel = this.channel;
    const connection = this.connection;
    const tag = this.consumerTag;
    this.channel = null;
    this.connection = null;
    this.consumerTag = null;
    if (channel && tag) {
      await channel.cancel(tag).catch(() => undefined);
    }
    await channel?.close().catch(() => undefined);
    await connection?.close().catch(() => undefined);
  }

  private async handleMessage(
    channel: Channel,
    message: ConsumeMessage | null,
  ): Promise<void> {
    if (!message) {
      return;
    }

    try {
      const envelope = parseEnvelope(message.content);
      await this.options.onMessage(envelope.routingKey, envelope.payload, {
        eventId: envelope.eventId,
        publishedAt: envelope.publishedAt,
      });
      channel.ack(message);
    } catch (error) {
      const requeue = !message.fields.redelivered;
      channel.nack(message, false, requeue);
      if (!requeue) {
        console.error(
          '[AmqpConsumer] message failed (sent to DLQ)',
          error instanceof Error ? error.message : error,
        );
      }
    }
  }
}
