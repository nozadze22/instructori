import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatRealtimeService } from './chat-realtime.service';
import { ChatService } from './chat.service';

@Module({
  imports: [AuthModule],
  controllers: [ChatController],
  providers: [ChatService, ChatRealtimeService, ChatGateway],
})
export class ChatModule {}
