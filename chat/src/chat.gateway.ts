import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { ACCESS_TOKEN_COOKIE } from './auth/auth-cookie';
import { getChatJwtSecret } from './chat-jwt';
import { ChatRealtimeService } from './chat-realtime.service';
import { MainApiClient } from './main-api/main-api.client';

type SocketJwtPayload = {
  sub: string;
  purpose?: string;
  sv?: number;
};

type ChatSocketData = {
  userId?: string;
};

type ChatHandshakeAuth = {
  token?: unknown;
};

type ChatSocket = Socket<
  Record<string, never>,
  Record<string, never>,
  Record<string, never>,
  ChatSocketData
>;

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: true,
    credentials: true,
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly mainApi: MainApiClient,
    private readonly realtime: ChatRealtimeService,
  ) {}

  afterInit(server: Server) {
    this.realtime.setServer(server);
    this.logger.log('Chat socket gateway ready');
  }

  async handleConnection(client: ChatSocket) {
    try {
      const token = this.extractToken(client);
      if (!token) {
        client.disconnect(true);
        return;
      }

      const payload = this.jwt.verify<SocketJwtPayload>(token, {
        secret: getChatJwtSecret(this.config),
      });

      if (payload.purpose !== 'chat') {
        client.disconnect(true);
        return;
      }

      const user = await this.mainApi.getUserSession(payload.sub);
      if (!user || user.accessStatus === 'BLOCKED') {
        client.disconnect(true);
        return;
      }

      const tokenVersion = payload.sv ?? 0;
      if (tokenVersion !== user.sessionVersion) {
        client.disconnect(true);
        return;
      }

      if (user.accessStatus !== 'ACTIVE') {
        client.disconnect(true);
        return;
      }

      client.data.userId = user.userId;
      await client.join(`user:${user.userId}`);
    } catch (error) {
      this.logger.debug(
        `Socket auth failed: ${error instanceof Error ? error.message : 'unknown'}`,
      );
      client.disconnect(true);
    }
  }

  handleDisconnect(client: ChatSocket) {
    const userId = client.data.userId;
    if (userId) {
      this.logger.debug(`Chat socket disconnected: ${userId}`);
    }
  }

  private extractToken(client: ChatSocket): string | null {
    const auth = client.handshake.auth as ChatHandshakeAuth;
    const authToken = auth.token;
    if (typeof authToken === 'string' && authToken.length > 0) {
      return authToken;
    }

    const header = client.handshake.headers.authorization;
    if (typeof header === 'string' && header.startsWith('Bearer ')) {
      return header.slice(7).trim() || null;
    }

    const rawCookie = client.handshake.headers.cookie;
    if (typeof rawCookie !== 'string' || !rawCookie) return null;

    const match = rawCookie
      .split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${ACCESS_TOKEN_COOKIE}=`));

    if (!match) return null;
    return decodeURIComponent(match.slice(`${ACCESS_TOKEN_COOKIE}=`.length));
  }
}
