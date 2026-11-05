import type { NotificationItem } from "@/features/notifications/schema/notifications.schema";

export function notificationHref(item: NotificationItem): string | null {
  const data = item.data ?? {};

  if (item.type === "INSTRUCTOR_MESSAGE") {
    return "/profile?tab=messages";
  }

  if (item.type === "INSTRUCTOR_REVIEW") {
    const instructorId = data.instructorId;
    if (typeof instructorId === "string") {
      return `/instructors/${instructorId}#reviews`;
    }
    return "/profile#reviews";
  }

  if (
    item.type === "INSTRUCTOR_REGISTRATION" ||
    item.type === "STUDENT_REGISTRATION"
  ) {
    return "/admin/users";
  }

  if (item.type === "SYSTEM_ROUTE") {
    const routeId = data.routeId;
    if (typeof routeId === "string" && routeId.includes("-")) {
      return `/marshrutebi/${routeId}`;
    }
    return "/marshrutebi";
  }

  if (item.type === "ACCESS_PENDING") {
    return "/profile";
  }

  if (item.type === "STUDENT_LINKED") {
    return "/profile/students";
  }

  return null;
}

export function formatNotificationWhen(iso: string): string {
  try {
    return new Intl.DateTimeFormat("ka-GE", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
