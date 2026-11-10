import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { ChatRealtimeService } from './chat-realtime.service';

const FANOUT_BATCH = 250;

@Injectable()
export class SystemInboxService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: ChatRealtimeService,
  ) {}

  async fanOutFromBroadcast(title: string, body: string, recipientUserIds: string[]) {
    for (let offset = 0; offset < recipientUserIds.length; offset += FANOUT_BATCH) {
      const batch = recipientUserIds.slice(offset, offset + FANOUT_BATCH);
      await this.prisma.systemInboxMessage.createMany({
        data: batch.map((userId) => ({
          userId,
          title,
          body,
        })),
      });
      for (const userId of batch) {
        this.realtime.emitSystemInbox(userId);
      }
    }

    return { recipientCount: recipientUserIds.length };
  }
}
