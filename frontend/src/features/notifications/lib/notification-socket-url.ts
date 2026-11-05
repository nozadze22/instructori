const DEFAULT_NOTIFICATION_SOCKET_URL =
  "https://simdrive-pro-notification.fly.dev";

export function getNotificationSocketUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_NOTIFICATION_SOCKET_URL?.trim().replace(
    /\/$/,
    "",
  );
  if (fromEnv) return fromEnv;

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:4002";
    }
  }

  return DEFAULT_NOTIFICATION_SOCKET_URL;
}
