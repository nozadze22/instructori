import { randomUUID } from 'node:crypto';

export type EventEnvelope<T = unknown> = {
  eventId: string;
  routingKey: string;
  publishedAt: string;
  payload: T;
};

export function createEnvelope<T>(
  routingKey: string,
  payload: T,
  eventId = randomUUID(),
): EventEnvelope<T> {
  return {
    eventId,
    routingKey,
    publishedAt: new Date().toISOString(),
    payload,
  };
}

export function parseEnvelope<T>(buffer: Buffer): EventEnvelope<T> {
  const parsed = JSON.parse(buffer.toString('utf8')) as EventEnvelope<T>;
  if (!parsed?.routingKey || parsed.payload === undefined) {
    throw new Error('Invalid event envelope');
  }
  return parsed;
}
