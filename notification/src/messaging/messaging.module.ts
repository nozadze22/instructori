import { Module } from '@nestjs/common';
import { EmailModule } from '../email/email.module';
import { NotificationsModule } from '../notifications.module';
import { EmailAmqpConsumer } from './email-amqp.consumer';
import { NotificationAmqpConsumer } from './notification-amqp.consumer';

@Module({
  imports: [NotificationsModule, EmailModule],
  providers: [NotificationAmqpConsumer, EmailAmqpConsumer],
})
export class MessagingModule {}
