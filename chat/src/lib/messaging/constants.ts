export const INSTRUCTOR_EVENTS_EXCHANGE = 'instructor.events';
export const INSTRUCTOR_EVENTS_DLX = 'instructor.events.dlx';

export const NOTIFICATION_QUEUE = 'notification-service';
export const CHAT_QUEUE = 'chat-service';
export const EMAIL_QUEUE = 'email-service';

export const NOTIFICATION_BINDING = 'notification.#';
export const CHAT_BINDING = 'chat.#';
export const EMAIL_BINDING = 'email.#';

/** Same slug as HTTP path under `/internal/events/:path` */
export type NotificationEventPath =
  | 'instructor-review-created'
  | 'instructor-message-created'
  | 'instructor-registration'
  | 'access-pending'
  | 'student-linked'
  | 'student-registration'
  | 'system-route'
  | 'system-message';

export type ChatEventPath = 'system-broadcast';

export type EmailEventPath =
  | 'send'
  | 'access-pending'
  | 'access-granted'
  | 'contact-admin'
  | 'admin-broadcast';

export function notificationRoutingKey(path: NotificationEventPath): string {
  return `notification.${path}`;
}

export function chatRoutingKey(path: ChatEventPath): string {
  return `chat.${path}`;
}

export function emailRoutingKey(path: EmailEventPath): string {
  return `email.${path}`;
}

export type EventTransport = 'http' | 'amqp' | 'dual';

export function parseEventTransport(raw: string | undefined): EventTransport {
  const value = raw?.trim().toLowerCase();
  if (value === 'amqp' || value === 'dual' || value === 'http') {
    return value;
  }
  return 'http';
}
