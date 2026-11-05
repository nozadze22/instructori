import { Injectable } from '@nestjs/common';
import type { Server } from 'socket.io';

export type NotificationSocketPayload = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  data: unknown;
  readAt: string | null;
  createdAt: string;
};

@Injectable()
export class NotificationsRealtimeService {
  private server: Server | null = null;

  setServer(server: Server) {
    this.server = server;
  }

  emitToUser(userId: string, event: string, payload: unknown) {
    this.server?.to(`user:${userId}`).emit(event, payload);
  }

  emitNew(userId: string, item: NotificationSocketPayload, unreadCount: number) {
    this.emitToUser(userId, 'notification:new', { item, unreadCount });
  }

  emitUnread(userId: string, unreadCount: number) {
    this.emitToUser(userId, 'notification:unread', { unreadCount });
  }
}
