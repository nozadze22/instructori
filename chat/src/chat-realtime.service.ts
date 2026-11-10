import { Injectable } from '@nestjs/common';
import type { Server } from 'socket.io';

export type ChatRealtimeMessage = {
  id: string;
  body: string;
  senderId: string;
  readAt: string | null;
  createdAt: string;
};

@Injectable()
export class ChatRealtimeService {
  private server: Server | null = null;

  setServer(server: Server) {
    this.server = server;
  }

  emitNewMessage(payload: {
    userLowId: string;
    userHighId: string;
    message: ChatRealtimeMessage;
  }) {
    if (!this.server) return;
    const event = 'chat:message';
    this.server.to(`user:${payload.userLowId}`).emit(event, payload);
    this.server.to(`user:${payload.userHighId}`).emit(event, payload);
  }

  emitRead(payload: {
    userLowId: string;
    userHighId: string;
    readerId: string;
  }) {
    if (!this.server) return;
    const event = 'chat:read';
    this.server.to(`user:${payload.userLowId}`).emit(event, payload);
    this.server.to(`user:${payload.userHighId}`).emit(event, payload);
  }

  emitSystemInbox(userId: string) {
    if (!this.server) return;
    this.server.to(`user:${userId}`).emit('chat:system', {});
  }
}
