import { Module } from '@nestjs/common';
import { ChatModule } from '../chat.module';
import { ChatAmqpConsumer } from './chat-amqp.consumer';

@Module({
  imports: [ChatModule],
  providers: [ChatAmqpConsumer],
})
export class MessagingModule {}
