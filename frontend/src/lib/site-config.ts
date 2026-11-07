/** Canonical production site (Vercel + custom domain). */
export const PRODUCTION_APP_URL = "https://www.instructorebi.com";

export const PRODUCTION_APP_ORIGINS = [
  "https://www.instructorebi.com",
  "https://instructorebi.com",
  "https://instructori.vercel.app",
] as const;

/** Fly-hosted API (unchanged when frontend moves to Vercel). */
export const PRODUCTION_BACKEND_URL = "https://simdrive-pro-api.fly.dev";

export const PRODUCTION_NOTIFICATION_URL =
  "https://simdrive-pro-notification.fly.dev";

export const LOCAL_APP_URL = "http://localhost:3001";
export const LOCAL_BACKEND_URL = "http://localhost:4001";
export const LOCAL_NOTIFICATION_URL = "http://localhost:4002";

/** Comma-separated value for Fly `CORS_ORIGIN` on API + notification apps. */
export const PRODUCTION_CORS_ORIGIN = PRODUCTION_APP_ORIGINS.join(",");

export function resolvePublicSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  const vercel = process.env.VERCEL_URL?.trim().replace(/\/$/, "");
  if (vercel) return `https://${vercel}`;

  if (process.env.NODE_ENV === "development") {
    return LOCAL_APP_URL;
  }

  return PRODUCTION_APP_URL;
}
