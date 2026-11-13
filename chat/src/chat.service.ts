import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { ChatRealtimeService } from './chat-realtime.service';
import { MainApiClient, type MainApiPeer } from './main-api/main-api.client';
import {
  isSystemChatPeerId,
  SYSTEM_CHAT_PEER_ID,
} from './chat-system-peer';

type ChatActor = {
  userId: string;
  role: 'ADMIN' | 'INSTRUCTOR' | 'USER';
};

type ChatPeerRelation = 'instructor' | 'student' | 'classmate' | 'system';

type ConversationPair = {
  userLowId: string;
  userHighId: string;
  peer: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl: string | null;
    role: 'INSTRUCTOR' | 'USER';
    relation: ChatPeerRelation;
  };
};

type PeerUser = MainApiPeer;

const DEFAULT_PAGE_SIZE = 30;

function orderedPair(a: string, b: string) {
  return a < b
    ? { userLowId: a, userHighId: b }
    : { userLowId: b, userHighId: a };
}

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: ChatRealtimeService,
    private readonly mainApi: MainApiClient,
  ) {}

  async createSocketToken(userId: string) {
    const user = await this.mainApi.getUserSession(userId);
    if (!user || user.accessStatus !== 'ACTIVE') {
      throw new ForbiddenException('Chat socket unavailable');
    }
    return {
      userId: user.userId,
      sessionVersion: user.sessionVersion,
    };
  }

  async listConversations(actor: ChatActor) {
    const peers = await this.listAllowedPeers(actor);

    const items = await Promise.all(
      peers.map(async (peer) => {
        const pair = orderedPair(actor.userId, peer.id);
        const clearedAt = await this.getClearedAt(
          pair.userLowId,
          pair.userHighId,
          actor.userId,
        );
        const visibleWhere = {
          userLowId: pair.userLowId,
          userHighId: pair.userHighId,
          ...(clearedAt ? { createdAt: { gt: clearedAt } } : {}),
        };

        const [last, unreadCount] = await Promise.all([
          this.prisma.chatMessage.findFirst({
            where: visibleWhere,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              body: true,
              senderId: true,
              createdAt: true,
            },
          }),
          this.prisma.chatMessage.count({
            where: {
              ...visibleWhere,
              senderId: { not: actor.userId },
              readAt: null,
            },
          }),
        ]);

        return {
          peer: {
            id: peer.id,
            fullName: peer.fullName,
            email: peer.email,
            avatarUrl: peer.avatarUrl,
            role: peer.role === 'INSTRUCTOR' ? ('INSTRUCTOR' as const) : ('USER' as const),
            relation: peer.relation,
          },
          lastMessage: last
            ? {
                id: last.id,
                body: last.body,
                senderId: last.senderId,
                createdAt: last.createdAt.toISOString(),
              }
            : null,
          unreadCount,
        };
      }),
    );

    const systemItem = await this.buildSystemConversation(actor.userId);
    const allItems = systemItem ? [...items, systemItem] : items;

    allItems.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt ?? '';
      const bTime = b.lastMessage?.createdAt ?? '';
      if (aTime !== bTime) return bTime.localeCompare(aTime);
      return a.peer.fullName.localeCompare(b.peer.fullName, 'ka');
    });

    return { items: allItems };
  }

  async listMessages(
    actor: ChatActor,
    peerId: string,
    options: { limit?: number; beforeId?: string } = {},
  ) {
    if (isSystemChatPeerId(peerId)) {
      return this.listSystemMessages(actor.userId, options);
    }

    const pair = await this.resolvePair(actor, peerId);
    const limit = Math.min(
      Math.max(options.limit ?? DEFAULT_PAGE_SIZE, 1),
      100,
    );
    const clearedAt = await this.getClearedAt(
      pair.userLowId,
      pair.userHighId,
      actor.userId,
    );

    let beforeCreatedAt: Date | undefined;
    if (options.beforeId) {
      const before = await this.prisma.chatMessage.findFirst({
        where: {
          id: options.beforeId,
          userLowId: pair.userLowId,
          userHighId: pair.userHighId,
        },
        select: { createdAt: true },
      });
      if (!before) {
        throw new NotFoundException('Message not found');
      }
      beforeCreatedAt = before.createdAt;
    }

    const createdAtFilter =
      clearedAt || beforeCreatedAt
        ? {
            ...(clearedAt ? { gt: clearedAt } : {}),
            ...(beforeCreatedAt ? { lt: beforeCreatedAt } : {}),
          }
        : undefined;

    const rows = await this.prisma.chatMessage.findMany({
      where: {
        userLowId: pair.userLowId,
        userHighId: pair.userHighId,
        ...(createdAtFilter ? { createdAt: createdAtFilter } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      select: {
        id: true,
        body: true,
        senderId: true,
        readAt: true,
        createdAt: true,
      },
    });

    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;

    return {
      peer: pair.peer,
      items: page.reverse().map((row) => this.mapMessage(row)),
      hasMore,
      pageSize: limit,
    };
  }

  async seedDirectMessage(
    senderId: string,
    recipientId: string,
    body: string,
  ) {
    const trimmed = body.trim();
    if (!trimmed) {
      throw new BadRequestException('Message cannot be empty');
    }
    if (senderId === recipientId) {
      throw new BadRequestException('Cannot chat with yourself');
    }

    const pair = orderedPair(senderId, recipientId);
    const existing = await this.prisma.chatMessage.findFirst({
      where: {
        userLowId: pair.userLowId,
        userHighId: pair.userHighId,
        senderId,
        body: trimmed,
      },
      select: { id: true },
    });
    if (existing) {
      return { id: existing.id, created: false };
    }

    const created = await this.prisma.chatMessage.create({
      data: {
        userLowId: pair.userLowId,
        userHighId: pair.userHighId,
        senderId,
        body: trimmed,
      },
      select: {
        id: true,
        body: true,
        senderId: true,
        readAt: true,
        createdAt: true,
      },
    });

    const message = this.mapMessage(created);
    this.realtime.emitNewMessage({
      userLowId: pair.userLowId,
      userHighId: pair.userHighId,
      message,
    });
    return { id: message.id, created: true };
  }

  async sendMessage(actor: ChatActor, peerId: string, body: string) {
    if (isSystemChatPeerId(peerId)) {
      throw new BadRequestException('Cannot reply to system messages');
    }
    const pair = await this.resolvePair(actor, peerId);
    const trimmed = body.trim();
    if (!trimmed) {
      throw new BadRequestException('Message cannot be empty');
    }

    const created = await this.prisma.chatMessage.create({
      data: {
        userLowId: pair.userLowId,
        userHighId: pair.userHighId,
        senderId: actor.userId,
        body: trimmed,
      },
      select: {
        id: true,
        body: true,
        senderId: true,
        readAt: true,
        createdAt: true,
      },
    });

    const message = this.mapMessage(created);
    this.realtime.emitNewMessage({
      userLowId: pair.userLowId,
      userHighId: pair.userHighId,
      message,
    });
    return message;
  }

  async markRead(actor: ChatActor, peerId: string) {
    if (isSystemChatPeerId(peerId)) {
      const result = await this.prisma.systemInboxMessage.updateMany({
        where: { userId: actor.userId, readAt: null },
        data: { readAt: new Date() },
      });
      return { updated: result.count };
    }

    const pair = await this.resolvePair(actor, peerId);
    const clearedAt = await this.getClearedAt(
      pair.userLowId,
      pair.userHighId,
      actor.userId,
    );
    const result = await this.prisma.chatMessage.updateMany({
      where: {
        userLowId: pair.userLowId,
        userHighId: pair.userHighId,
        senderId: { not: actor.userId },
        readAt: null,
        ...(clearedAt ? { createdAt: { gt: clearedAt } } : {}),
      },
      data: { readAt: new Date() },
    });
    if (result.count > 0) {
      this.realtime.emitRead({
        userLowId: pair.userLowId,
        userHighId: pair.userHighId,
        readerId: actor.userId,
      });
    }
    return { updated: result.count };
  }

  async clearForMe(actor: ChatActor, peerId: string) {
    if (isSystemChatPeerId(peerId)) {
      await this.prisma.systemInboxMessage.deleteMany({
        where: { userId: actor.userId },
      });
      return { clearedAt: new Date().toISOString() };
    }

    const pair = await this.resolvePair(actor, peerId);
    const clearedAt = new Date();

    await this.prisma.chatThreadClear.upsert({
      where: {
        userLowId_userHighId_userId: {
          userLowId: pair.userLowId,
          userHighId: pair.userHighId,
          userId: actor.userId,
        },
      },
      create: {
        userLowId: pair.userLowId,
        userHighId: pair.userHighId,
        userId: actor.userId,
        clearedAt,
      },
      update: { clearedAt },
    });

    await this.prisma.chatMessage.updateMany({
      where: {
        userLowId: pair.userLowId,
        userHighId: pair.userHighId,
        senderId: { not: actor.userId },
        readAt: null,
      },
      data: { readAt: clearedAt },
    });

    return { clearedAt: clearedAt.toISOString() };
  }

  private async listAllowedPeers(actor: ChatActor): Promise<PeerUser[]> {
    return this.mainApi.getAllowedPeers(actor.userId, actor.role);
  }

  private async getClearedAt(
    userLowId: string,
    userHighId: string,
    userId: string,
  ): Promise<Date | null> {
    const row = await this.prisma.chatThreadClear.findUnique({
      where: {
        userLowId_userHighId_userId: {
          userLowId,
          userHighId,
          userId,
        },
      },
      select: { clearedAt: true },
    });
    return row?.clearedAt ?? null;
  }

  private async resolvePair(
    actor: ChatActor,
    peerId: string,
  ): Promise<ConversationPair> {
    if (peerId === actor.userId) {
      throw new BadRequestException('Cannot chat with yourself');
    }

    const peers = await this.listAllowedPeers(actor);
    const peer = peers.find((item) => item.id === peerId);
    if (!peer) {
      throw new ForbiddenException('You cannot chat with this user');
    }

    const pair = orderedPair(actor.userId, peer.id);
    return {
      ...pair,
      peer: {
        id: peer.id,
        fullName: peer.fullName,
        email: peer.email,
        avatarUrl: peer.avatarUrl,
        role: peer.role === 'INSTRUCTOR' ? 'INSTRUCTOR' : 'USER',
        relation: peer.relation,
      },
    };
  }

  private mapMessage(row: {
    id: string;
    body: string;
    senderId: string;
    readAt: Date | null;
    createdAt: Date;
  }) {
    return {
      id: row.id,
      body: row.body,
      senderId: row.senderId,
      readAt: row.readAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
      kind: 'user' as const,
    };
  }

  private systemPeer() {
    return {
      id: SYSTEM_CHAT_PEER_ID,
      fullName: 'სისტემა',
      email: '',
      avatarUrl: null,
      role: 'USER' as const,
      relation: 'system' as const,
    };
  }

  private async buildSystemConversation(userId: string) {
    const [last, unreadCount] = await Promise.all([
      this.prisma.systemInboxMessage.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          body: true,
          createdAt: true,
        },
      }),
      this.prisma.systemInboxMessage.count({
        where: { userId, readAt: null },
      }),
    ]);

    if (!last) return null;

    const preview = last.title.trim()
      ? `${last.title}: ${last.body}`
      : last.body;

    return {
      peer: this.systemPeer(),
      lastMessage: {
        id: last.id,
        body: preview,
        senderId: SYSTEM_CHAT_PEER_ID,
        createdAt: last.createdAt.toISOString(),
      },
      unreadCount,
    };
  }

  private async listSystemMessages(
    userId: string,
    options: { limit?: number; beforeId?: string } = {},
  ) {
    const limit = Math.min(
      Math.max(options.limit ?? DEFAULT_PAGE_SIZE, 1),
      100,
    );

    let beforeCreatedAt: Date | undefined;
    if (options.beforeId) {
      const before = await this.prisma.systemInboxMessage.findFirst({
        where: { id: options.beforeId, userId },
        select: { createdAt: true },
      });
      if (!before) {
        throw new NotFoundException('Message not found');
      }
      beforeCreatedAt = before.createdAt;
    }

    const rows = await this.prisma.systemInboxMessage.findMany({
      where: {
        userId,
        ...(beforeCreatedAt ? { createdAt: { lt: beforeCreatedAt } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      select: {
        id: true,
        title: true,
        body: true,
        readAt: true,
        createdAt: true,
      },
    });

    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;

    return {
      peer: this.systemPeer(),
      items: page.reverse().map((row) => this.mapSystemMessage(row)),
      hasMore,
      pageSize: limit,
    };
  }

  private mapSystemMessage(row: {
    id: string;
    title: string;
    body: string;
    readAt: Date | null;
    createdAt: Date;
  }) {
    return {
      id: row.id,
      title: row.title,
      body: row.body,
      senderId: SYSTEM_CHAT_PEER_ID,
      readAt: row.readAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
      kind: 'system' as const,
    };
  }
}
