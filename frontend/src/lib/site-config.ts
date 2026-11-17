/** Canonical production site (Vercel + custom domain). */
export const PRODUCTION_APP_URL = "https://www.instructorebi.com";

/** Browser tab, PWA, and metadata brand (not legacy SimDrive). */
export const APP_BRAND_NAME = "ინსტრუქტორები";
export const APP_BRAND_NAME_LATIN = "Instructorebi";
/** Public support inbox (UI + contact page). */
export const APP_SUPPORT_EMAIL = "support@instructorebi.com";
export const APP_DEFAULT_TITLE = `${APP_BRAND_NAME} | მართვის გამოცდის მომზადება`;
export const APP_TITLE_TEMPLATE = `%s | ${APP_BRAND_NAME}`;

export const PRODUCTION_APP_ORIGINS = [
  "https://www.instructorebi.com",
  "https://instructorebi.com",
  "https://instructori.vercel.app",
] as const;

/** Fly-hosted API (unchanged when frontend moves to Vercel). */
export const PRODUCTION_BACKEND_URL = "https://simdrive-pro-api.fly.dev";

export const PRODUCTION_NOTIFICATION_URL =
  "https://simdrive-pro-notification.fly.dev";

export const PRODUCTION_CHAT_URL = "https://simdrive-pro-chat.fly.dev";

export const LOCAL_APP_URL = "http://localhost:3001";
export const LOCAL_BACKEND_URL = "http://localhost:4001";
/** Use 127.0.0.1 in dev — Node fetch on Windows often hits ::1 while Nest binds IPv4 only. */
export const LOCAL_NOTIFICATION_URL = "http://127.0.0.1:4002";
export const LOCAL_CHAT_URL = "http://127.0.0.1:4003";

/** Comma-separated value for Fly `CORS_ORIGIN` on API + notification apps. */
export const PRODUCTION_CORS_ORIGIN = PRODUCTION_APP_ORIGINS.join(",");

/**
 * Canonical absolute site URL for metadata, sitemap, robots, OG links.
 * On Vercel production (custom domain), never use VERCEL_URL — it is the
 * deployment host (*.vercel.app), which breaks Search Console sitemaps.
 */
export function resolvePublicSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  if (process.env.NODE_ENV === "development") {
    return LOCAL_APP_URL;
  }

  if (process.env.VERCEL_ENV === "preview") {
    const vercel = process.env.VERCEL_URL?.trim().replace(/\/$/, "");
    if (vercel) return `https://${vercel}`;
  }

  return PRODUCTION_APP_URL;
}
