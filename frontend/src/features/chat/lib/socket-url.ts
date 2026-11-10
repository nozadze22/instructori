import {
  LOCAL_CHAT_URL,
  PRODUCTION_CHAT_URL,
} from "@/lib/site-config";

export function getChatSocketUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_CHAT_SOCKET_URL?.trim().replace(
    /\/$/,
    "",
  );
  if (fromEnv) return fromEnv;

  const serviceUrl = process.env.NEXT_PUBLIC_CHAT_SERVICE_URL?.trim().replace(
    /\/$/,
    "",
  );
  if (serviceUrl) return serviceUrl;

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return LOCAL_CHAT_URL;
    }
  }

  return PRODUCTION_CHAT_URL;
}
