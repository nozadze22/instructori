import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ChatInternalSecretGuard } from './chat-internal-secret.guard';
import { ChatPeersService } from './chat-peers.service';

@Controller('internal/chat')
@UseGuards(ChatInternalSecretGuard)
export class ChatInternalController {
  constructor(private readonly peers: ChatPeersService) {}

  @Get('user-session/:userId')
  getUserSession(@Param('userId') userId: string) {
    return this.peers.getUserSession(userId);
  }

  @Get('allowed-peers')
  async allowedPeers(
    @Query('userId') userId: string,
    @Query('role') role: string,
  ) {
    if (!userId?.trim()) {
      throw new BadRequestException('userId required');
    }
    if (role !== 'ADMIN' && role !== 'INSTRUCTOR' && role !== 'USER') {
      throw new BadRequestException('Invalid role');
    }
    const peers = await this.peers.listAllowedPeers(
      userId.trim(),
      role,
    );
    return { peers };
  }
}
