import { Module } from '@nestjs/common';
import { ChatModule } from '../chat.module';
import { InternalEventsController } from './internal-events.controller';
import { InternalSecretGuard } from './internal-secret.guard';

@Module({
  imports: [ChatModule],
  controllers: [InternalEventsController],
  providers: [InternalSecretGuard],
})
export class InternalModule {}
