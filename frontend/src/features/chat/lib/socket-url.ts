import {
  LOCAL_BACKEND_URL,
  PRODUCTION_BACKEND_URL,
} from "@/lib/site-config";

export function getChatSocketUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_BACKEND_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return LOCAL_BACKEND_URL;
    }
  }

  return PRODUCTION_BACKEND_URL;
}
