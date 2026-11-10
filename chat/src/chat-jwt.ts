import type { ConfigService } from '@nestjs/config';

export const CHAT_SOCKET_TOKEN_EXPIRES_IN = '15m';

export function getChatJwtSecret(config: ConfigService): string {
  const dedicated = config.get<string>('JWT_CHAT_SECRET')?.trim();
  if (dedicated) {
    return dedicated;
  }
  return config.getOrThrow<string>('JWT_SECRET');
}
