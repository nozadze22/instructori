import type { Request } from 'express';

export const ACCESS_TOKEN_COOKIE = 'access_token';

export function readAccessToken(req: Request): string | null {
  const cookies = req.cookies as Record<string, unknown> | undefined;
  const token = cookies?.[ACCESS_TOKEN_COOKIE];
  return typeof token === 'string' ? token : null;
}
