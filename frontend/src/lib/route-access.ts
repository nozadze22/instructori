/** Paths app users (role USER) may visit without a 403. */
const APP_USER_PUBLIC_PATHS = [
  /^\/$/,
  /^\/contact$/,
  /^\/about$/,
  /^\/profile(\/.*)?$/,
  /^\/login$/,
  /^\/register$/,
  /^\/forbidden$/,
] as const;

/** Known instructor/admin app routes — visiting as USER yields 403. */
const INSTRUCTOR_ONLY_PATHS = [
  /^\/admin(\/.*)?$/,
  /^\/dashboard(\/.*)?$/,
  /^\/routes(\/.*)?$/,
  /^\/marshrutebi(\/.*)?$/,
  /^\/chemi-marshrutebi(\/.*)?$/,
  /^\/practice(\/.*)?$/,
  /^\/mistake-notes(\/.*)?$/,
  /^\/my-practices(\/.*)?$/,
  /^\/pending(\/.*)?$/,
] as const;

export const FORBIDDEN_PATH = "/forbidden";

export function isAppUserPublicPath(pathname: string): boolean {
  return APP_USER_PUBLIC_PATHS.some((pattern) => pattern.test(pathname));
}

export function isInstructorOnlyPath(pathname: string): boolean {
  if (pathname.startsWith("/admin/setup")) return false;
  return INSTRUCTOR_ONLY_PATHS.some((pattern) => pattern.test(pathname));
}

export function forbiddenPath(from?: string): string {
  if (!from) return FORBIDDEN_PATH;
  return `${FORBIDDEN_PATH}?from=${encodeURIComponent(from)}`;
}
