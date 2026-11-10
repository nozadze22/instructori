import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { SystemBroadcastDto } from '../dto/chat.dto';
import { SystemInboxService } from '../system-inbox.service';
import { InternalSecretGuard } from './internal-secret.guard';

@Controller('internal/events')
@UseGuards(InternalSecretGuard)
export class InternalEventsController {
  constructor(private readonly systemInbox: SystemInboxService) {}

  @Post('system-broadcast')
  systemBroadcast(@Body() dto: SystemBroadcastDto) {
    return this.systemInbox.fanOutFromBroadcast(
      dto.title,
      dto.body,
      dto.recipientUserIds,
    );
  }
}
