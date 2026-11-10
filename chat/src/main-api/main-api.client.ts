import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type MainApiPeer = {
  id: string;
  fullName: string;
  email: string;
  role: 'ADMIN' | 'INSTRUCTOR' | 'USER';
  avatarUrl: string | null;
  relation: 'instructor' | 'student' | 'classmate' | 'system';
};

export type MainApiUserSession = {
  userId: string;
  sessionVersion: number;
  accessStatus: 'PENDING' | 'ACTIVE' | 'BLOCKED';
};

@Injectable()
export class MainApiClient {
  private readonly logger = new Logger(MainApiClient.name);

  constructor(private readonly config: ConfigService) {}

  async getUserSession(userId: string): Promise<MainApiUserSession | null> {
    const baseUrl = this.baseUrl();
    if (!baseUrl) return null;

    const url = `${baseUrl}/internal/chat/user-session/${encodeURIComponent(userId)}`;
    const response = await this.authedFetch(url);
    if (response.status === 404) return null;
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      this.logger.warn(
        `user-session ${response.status}: ${text.slice(0, 200)}`,
      );
      throw new ServiceUnavailableException('Main API unavailable');
    }
    return (await response.json()) as MainApiUserSession;
  }

  async getAllowedPeers(
    userId: string,
    role: 'ADMIN' | 'INSTRUCTOR' | 'USER',
  ): Promise<MainApiPeer[]> {
    const baseUrl = this.baseUrl();
    if (!baseUrl) return [];

    const params = new URLSearchParams({ userId, role });
    const url = `${baseUrl}/internal/chat/allowed-peers?${params}`;
    const response = await this.authedFetch(url);
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      this.logger.warn(
        `allowed-peers ${response.status}: ${text.slice(0, 200)}`,
      );
      throw new ServiceUnavailableException('Main API unavailable');
    }
    const body = (await response.json()) as { peers: MainApiPeer[] };
    return body.peers ?? [];
  }

  private baseUrl(): string | null {
    const raw = this.config.get<string>('MAIN_API_URL')?.trim();
    if (!raw) {
      this.logger.error('MAIN_API_URL unset');
      return null;
    }
    return raw.replace(/\/$/, '');
  }

  private authedFetch(url: string, init?: RequestInit): Promise<Response> {
    const secret = this.config.get<string>('CHAT_INTERNAL_SECRET')?.trim();
    if (!secret) {
      this.logger.error('CHAT_INTERNAL_SECRET unset');
      return Promise.reject(
        new ServiceUnavailableException('Chat internal API not configured'),
      );
    }
    return fetch(url, {
      ...init,
      headers: {
        ...(init?.headers ?? {}),
        'X-Chat-Secret': secret,
      },
    });
  }
}
