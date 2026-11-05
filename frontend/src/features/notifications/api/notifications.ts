import {
  notificationListQuerySchema,
  notificationListResponseSchema,
  notificationUnreadCountSchema,
  type NotificationListQuery,
  type NotificationListResponse,
  type NotificationUnreadCount,
} from "@/features/notifications/schema/notifications.schema";

/** Proxied to notification microservice via Next `/api/notifications/*`. */
export const NOTIFICATIONS_API_BASE = "/api/notifications";

async function notificationRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const response = await fetch(`${NOTIFICATIONS_API_BASE}${normalized}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const text = (await response.text()).trim();
    let message = text || `Request failed: ${response.status}`;
    try {
      const parsed = JSON.parse(text) as { message?: string };
      if (parsed.message) message = parsed.message;
    } catch {
      // keep raw
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function getNotificationUnreadCount(): Promise<NotificationUnreadCount> {
  return notificationRequest<unknown>("/unread-count").then((data) =>
    notificationUnreadCountSchema.parse(data),
  );
}

export function getNotifications(
  query: Partial<NotificationListQuery> = {},
): Promise<NotificationListResponse> {
  const parsed = notificationListQuerySchema.parse(query);
  const search = new URLSearchParams({
    filter: parsed.filter,
    page: String(parsed.page),
    pageSize: String(parsed.pageSize),
  });

  return notificationRequest<unknown>(`?${search.toString()}`).then((data) =>
    notificationListResponseSchema.parse(data),
  );
}

export function markNotificationRead(id: string): Promise<{ ok: true }> {
  return notificationRequest<{ ok: true }>(`/${id}/read`, { method: "PATCH" });
}

export function markAllNotificationsRead(): Promise<{ ok: true }> {
  return notificationRequest<{ ok: true }>("/read-all", { method: "PATCH" });
}

export function getNotificationSocketToken(): Promise<{ token: string }> {
  return notificationRequest<{ token: string }>("/socket-token");
}

export type { NotificationItem } from "@/features/notifications/schema/notifications.schema";
