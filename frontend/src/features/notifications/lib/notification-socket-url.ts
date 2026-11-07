import {
  LOCAL_NOTIFICATION_URL,
  PRODUCTION_NOTIFICATION_URL,
} from "@/lib/site-config";

export function getNotificationSocketUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_NOTIFICATION_SOCKET_URL?.trim().replace(
    /\/$/,
    "",
  );
  if (fromEnv) return fromEnv;

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return LOCAL_NOTIFICATION_URL;
    }
  }

  return PRODUCTION_NOTIFICATION_URL;
}
