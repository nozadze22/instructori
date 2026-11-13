import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { SeedDirectMessageDto, SystemBroadcastDto } from '../dto/chat.dto';
import { ChatService } from '../chat.service';
import { SystemInboxService } from '../system-inbox.service';
import { InternalSecretGuard } from './internal-secret.guard';

@Controller('internal/events')
@UseGuards(InternalSecretGuard)
export class InternalEventsController {
  constructor(
    private readonly systemInbox: SystemInboxService,
    private readonly chat: ChatService,
  ) {}

  @Post('system-broadcast')
  systemBroadcast(@Body() dto: SystemBroadcastDto) {
    return this.systemInbox.fanOutFromBroadcast(
      dto.title,
      dto.body,
      dto.recipientUserIds,
    );
  }

  @Post('seed-direct-message')
  seedDirectMessage(@Body() dto: SeedDirectMessageDto) {
    return this.chat.seedDirectMessage(
      dto.senderId,
      dto.recipientId,
      dto.body,
    );
  }
}
