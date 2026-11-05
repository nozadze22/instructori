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
import {
  authUserFromAccessJwt,
  type AccessJwtPayload,
} from './auth/jwt-payload';
import { NotificationsRealtimeService } from './notifications-realtime.service';

type NotificationSocketData = {
  userId?: string;
};

type NotificationSocket = Socket<
  Record<string, never>,
  Record<string, never>,
  Record<string, never>,
  NotificationSocketData
>;

@WebSocketGateway({
  namespace: '/notifications',
  cors: {
    origin: true,
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(NotificationsGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly realtime: NotificationsRealtimeService,
  ) {}

  afterInit(server: Server) {
    this.realtime.setServer(server);
    this.logger.log('Notification socket gateway ready');
  }

  handleConnection(client: NotificationSocket) {
    try {
      const token = this.extractToken(client);
      if (!token) {
        client.disconnect(true);
        return;
      }

      const payload = this.jwt.verify<AccessJwtPayload>(token, {
        secret: this.config.getOrThrow<string>('JWT_SECRET'),
      });

      const user = authUserFromAccessJwt(payload);
      client.data.userId = user.userId;
      void client.join(`user:${user.userId}`);
    } catch (error) {
      this.logger.debug(
        `Notification socket auth failed: ${error instanceof Error ? error.message : 'unknown'}`,
      );
      client.disconnect(true);
    }
  }

  handleDisconnect(client: NotificationSocket) {
    const userId = client.data.userId;
    if (userId) {
      this.logger.debug(`Notification socket disconnected: ${userId}`);
    }
  }

  private extractToken(client: NotificationSocket): string | null {
    const auth = client.handshake.auth as { token?: unknown };
    if (typeof auth.token === 'string' && auth.token.length > 0) {
      return auth.token;
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
