export const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";

const TURNSTILE_TEST_SITE_KEYS = new Set([
  "1x00000000000000000000AA",
  "2x00000000000000000000AB",
  "3x00000000000000000000FF",
]);

export function isTurnstileEnabled(): boolean {
  return TURNSTILE_SITE_KEY.length > 0;
}

/** Cloudflare test sitekeys show a visible “testing only” banner in the widget. */
export function isTurnstileTestMode(): boolean {
  return TURNSTILE_TEST_SITE_KEYS.has(TURNSTILE_SITE_KEY);
}
