import { Module } from '@nestjs/common';
import { ChatInternalController } from './chat-internal.controller';
import { ChatInternalSecretGuard } from './chat-internal-secret.guard';
import { ChatPeersService } from './chat-peers.service';

@Module({
  controllers: [ChatInternalController],
  providers: [ChatPeersService, ChatInternalSecretGuard],
  exports: [ChatPeersService],
})
export class ChatInternalModule {}
