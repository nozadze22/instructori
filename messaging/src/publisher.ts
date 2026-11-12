import { connect, type Channel } from 'amqplib';

type AmqpConnection = Awaited<ReturnType<typeof connect>>;
import { INSTRUCTOR_EVENTS_EXCHANGE } from './constants.js';
import { createEnvelope } from './envelope.js';
import { assertInstructorEventTopology } from './topology.js';

export type AmqpPublisherOptions = {
  url: string;
  exchange?: string;
};

export class AmqpPublisher {
  private connection: AmqpConnection | null = null;
  private channel: Channel | null = null;
  private connecting: Promise<void> | null = null;
  private readonly exchange: string;

  constructor(private readonly options: AmqpPublisherOptions) {
    this.exchange = options.exchange ?? INSTRUCTOR_EVENTS_EXCHANGE;
  }

  async publish(routingKey: string, payload: unknown): Promise<void> {
    await this.ensureChannel();
    const channel = this.channel;
    if (!channel) {
      throw new Error('AMQP channel not available');
    }

    const envelope = createEnvelope(routingKey, payload);
    const body = Buffer.from(JSON.stringify(envelope), 'utf8');
    const ok = channel.publish(this.exchange, routingKey, body, {
      persistent: true,
      contentType: 'application/json',
    });
    if (!ok) {
      throw new Error('AMQP publish buffer full — retry later');
    }
  }

  async close(): Promise<void> {
    const channel = this.channel;
    const connection = this.connection;
    this.channel = null;
    this.connection = null;
    this.connecting = null;
    await channel?.close().catch(() => undefined);
    await connection?.close().catch(() => undefined);
  }

  private async ensureChannel(): Promise<void> {
    if (this.channel) {
      return;
    }
    if (!this.connecting) {
      this.connecting = this.connect();
    }
    await this.connecting;
  }

  private async connect(): Promise<void> {
    const connection = await connect(this.options.url);
    const channel = await connection.createChannel();
    await assertInstructorEventTopology(channel);
    connection.on('error', () => {
      void this.close();
    });
    connection.on('close', () => {
      this.channel = null;
      this.connection = null;
      this.connecting = null;
    });
    this.connection = connection;
    this.channel = channel;
  }
}
