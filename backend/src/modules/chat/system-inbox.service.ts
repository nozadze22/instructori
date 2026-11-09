import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ChatRealtimeService } from './chat-realtime.service';

const FANOUT_BATCH = 250;

@Injectable()
export class SystemInboxService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: ChatRealtimeService,
  ) {}

  async fanOutFromBroadcast(title: string, body: string) {
    const users = await this.prisma.user.findMany({
      where: { accessStatus: { not: 'BLOCKED' } },
      select: { id: true },
    });

    for (let offset = 0; offset < users.length; offset += FANOUT_BATCH) {
      const batch = users.slice(offset, offset + FANOUT_BATCH);
      await this.prisma.systemInboxMessage.createMany({
        data: batch.map((user) => ({
          userId: user.id,
          title,
          body,
        })),
      });
      for (const user of batch) {
        this.realtime.emitSystemInbox(user.id);
      }
    }

    return { recipientCount: users.length };
  }
}
