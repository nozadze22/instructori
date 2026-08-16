import type { CookieOptions, Response } from 'express';

export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';

export const ACCESS_TOKEN_MAX_AGE_MS = 15 * 60 * 1000;
export const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function baseCookieOptions(): CookieOptions {
  const isProd = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
  };
}

export function getAccessCookieOptions(): CookieOptions {
  return {
    ...baseCookieOptions(),
    maxAge: ACCESS_TOKEN_MAX_AGE_MS,
  };
}

export function getRefreshCookieOptions(): CookieOptions {
  return {
    ...baseCookieOptions(),
    maxAge: REFRESH_TOKEN_MAX_AGE_MS,
  };
}

export function setAuthCookies(
  res: Response,
  tokens: { accessToken: string; refreshToken: string },
): void {
  res.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, getAccessCookieOptions());
  res.cookie(
    REFRESH_TOKEN_COOKIE,
    tokens.refreshToken,
    getRefreshCookieOptions(),
  );
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_TOKEN_COOKIE, getAccessCookieOptions());
  res.clearCookie(REFRESH_TOKEN_COOKIE, getRefreshCookieOptions());
}

export function readRefreshToken(req: {
  cookies?: Record<string, unknown>;
}): string | null {
  const token = req.cookies?.[REFRESH_TOKEN_COOKIE];
  return typeof token === 'string' && token.length > 0 ? token : null;
}
