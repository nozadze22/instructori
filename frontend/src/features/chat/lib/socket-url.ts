const DEFAULT_BACKEND_URL = "https://simdrive-pro-api.fly.dev";

export function getChatSocketUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_BACKEND_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:4001";
    }
  }

  return DEFAULT_BACKEND_URL;
}
