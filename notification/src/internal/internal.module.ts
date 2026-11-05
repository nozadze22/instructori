import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications.module';
import { InternalEventsController } from './internal-events.controller';
import { InternalSecretGuard } from './internal-secret.guard';

@Module({
  imports: [NotificationsModule],
  controllers: [InternalEventsController],
  providers: [InternalSecretGuard],
})
export class InternalModule {}
