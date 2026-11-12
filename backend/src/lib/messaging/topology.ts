import type { Channel } from 'amqplib';
import {
  CHAT_BINDING,
  CHAT_QUEUE,
  EMAIL_BINDING,
  EMAIL_QUEUE,
  INSTRUCTOR_EVENTS_DLX,
  INSTRUCTOR_EVENTS_EXCHANGE,
  NOTIFICATION_BINDING,
  NOTIFICATION_QUEUE,
} from './constants.js';

async function assertQueueWithDlx(
  channel: Channel,
  queue: string,
  bindingPattern: string,
): Promise<void> {
  await channel.assertExchange(INSTRUCTOR_EVENTS_DLX, 'direct', {
    durable: true,
  });

  const dlq = `${queue}.dlq`;
  await channel.assertQueue(dlq, { durable: true });
  await channel.bindQueue(dlq, INSTRUCTOR_EVENTS_DLX, `${queue}.dead`);

  await channel.assertQueue(queue, {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': INSTRUCTOR_EVENTS_DLX,
      'x-dead-letter-routing-key': `${queue}.dead`,
    },
  });
  await channel.bindQueue(queue, INSTRUCTOR_EVENTS_EXCHANGE, bindingPattern);
}

export async function assertInstructorEventTopology(
  channel: Channel,
): Promise<void> {
  await channel.assertExchange(INSTRUCTOR_EVENTS_EXCHANGE, 'topic', {
    durable: true,
  });
  await assertQueueWithDlx(channel, NOTIFICATION_QUEUE, NOTIFICATION_BINDING);
  await assertQueueWithDlx(channel, CHAT_QUEUE, CHAT_BINDING);
  await assertQueueWithDlx(channel, EMAIL_QUEUE, EMAIL_BINDING);
}
