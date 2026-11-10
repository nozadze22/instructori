import { Global, Module } from '@nestjs/common';
import { ChatClientService } from './chat-client.service';

@Global()
@Module({
  providers: [ChatClientService],
  exports: [ChatClientService],
})
export class ChatClientModule {}
