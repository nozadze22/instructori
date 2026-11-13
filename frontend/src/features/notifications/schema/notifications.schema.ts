import { z } from "zod";

/** Matches backend `NotificationType` enum. */
export const notificationTypeSchema = z.enum([
  "INSTRUCTOR_REVIEW",
  "INSTRUCTOR_MESSAGE",
  "INSTRUCTOR_REGISTRATION",
  "ACCESS_PENDING",
  "STUDENT_LINKED",
  "CHAT_REQUEST_ACCEPTED",
  "STUDENT_REGISTRATION",
  "SYSTEM_ROUTE",
  "SYSTEM_MESSAGE",
]);

export type NotificationType = z.infer<typeof notificationTypeSchema>;

export const notificationItemSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  body: z.string().nullable(),
  data: z.record(z.string(), z.unknown()).nullable(),
  readAt: z.string().nullable(),
  createdAt: z.string(),
});

export type NotificationItem = z.infer<typeof notificationItemSchema>;

export const notificationListFilterSchema = z.enum(["all", "unread"]);

export const notificationListQuerySchema = z.object({
  filter: notificationListFilterSchema.default("all"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(30),
});

export type NotificationListQuery = z.infer<typeof notificationListQuerySchema>;

export const notificationListResponseSchema = z.object({
  items: z.array(notificationItemSchema),
  page: z.number(),
  pageSize: z.number(),
  total: z.number(),
  totalPages: z.number(),
  unreadCount: z.number(),
});

export type NotificationListResponse = z.infer<
  typeof notificationListResponseSchema
>;

export const notificationUnreadCountSchema = z.object({
  unreadCount: z.number(),
});

export type NotificationUnreadCount = z.infer<
  typeof notificationUnreadCountSchema
>;
