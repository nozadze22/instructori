import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatRealtimeService } from './chat-realtime.service';
import { ChatService } from './chat.service';
import { SystemInboxService } from './system-inbox.service';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [ChatController],
  providers: [ChatService, ChatRealtimeService, ChatGateway, SystemInboxService],
  exports: [SystemInboxService],
})
export class ChatModule {}
