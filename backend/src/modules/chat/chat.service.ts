import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ChatRealtimeService } from './chat-realtime.service';

type ChatActor = {
  userId: string;
  role: 'ADMIN' | 'INSTRUCTOR' | 'USER';
};

type ChatPeerRelation = 'instructor' | 'student' | 'classmate';

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

type PeerUser = {
  id: string;
  fullName: string;
  email: string;
  role: 'ADMIN' | 'INSTRUCTOR' | 'USER';
  avatarUrl: string | null;
  relation: ChatPeerRelation;
};

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
  ) {}

  async createSocketToken(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, sessionVersion: true, accessStatus: true },
    });
    if (!user || user.accessStatus !== 'ACTIVE') {
      throw new ForbiddenException('Chat socket unavailable');
    }
    return {
      userId: user.id,
      sessionVersion: user.sessionVersion,
    };
  }

  async listConversations(actor: ChatActor) {
    const peers = await this.listAllowedPeers(actor);
    if (peers.length === 0) {
      return { items: [] };
    }

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

    items.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt ?? '';
      const bTime = b.lastMessage?.createdAt ?? '';
      if (aTime !== bTime) return bTime.localeCompare(aTime);
      return a.peer.fullName.localeCompare(b.peer.fullName, 'ka');
    });

    return { items };
  }

  async listMessages(
    actor: ChatActor,
    peerId: string,
    options: { limit?: number; beforeId?: string } = {},
  ) {
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

  async sendMessage(actor: ChatActor, peerId: string, body: string) {
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
    if (actor.role === 'INSTRUCTOR' || actor.role === 'ADMIN') {
      const students = await this.prisma.user.findMany({
        where: {
          role: 'USER',
          linkedInstructorId: actor.userId,
          accessStatus: 'ACTIVE',
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          profile: { select: { avatarUrl: true } },
        },
        orderBy: { fullName: 'asc' },
      });

      return students.map((student) => ({
        id: student.id,
        fullName: student.fullName,
        email: student.email,
        role: student.role,
        avatarUrl: student.profile?.avatarUrl ?? null,
        relation: 'student' as const,
      }));
    }

    if (actor.role === 'USER') {
      const me = await this.prisma.user.findUnique({
        where: { id: actor.userId },
        select: {
          linkedInstructorId: true,
          linkedInstructor: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
              accessStatus: true,
              profile: { select: { avatarUrl: true } },
            },
          },
        },
      });

      if (!me?.linkedInstructorId) {
        return [];
      }

      const peers: PeerUser[] = [];

      if (
        me.linkedInstructor &&
        me.linkedInstructor.accessStatus === 'ACTIVE'
      ) {
        peers.push({
          id: me.linkedInstructor.id,
          fullName: me.linkedInstructor.fullName,
          email: me.linkedInstructor.email,
          role: me.linkedInstructor.role,
          avatarUrl: me.linkedInstructor.profile?.avatarUrl ?? null,
          relation: 'instructor',
        });
      }

      const classmates = await this.prisma.user.findMany({
        where: {
          role: 'USER',
          linkedInstructorId: me.linkedInstructorId,
          accessStatus: 'ACTIVE',
          id: { not: actor.userId },
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          profile: { select: { avatarUrl: true } },
        },
        orderBy: { fullName: 'asc' },
      });

      for (const mate of classmates) {
        peers.push({
          id: mate.id,
          fullName: mate.fullName,
          email: mate.email,
          role: mate.role,
          avatarUrl: mate.profile?.avatarUrl ?? null,
          relation: 'classmate',
        });
      }

      return peers;
    }

    return [];
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
    };
  }
}
