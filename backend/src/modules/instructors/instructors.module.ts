import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ChatClientModule } from '../chat-client/chat-client.module';
import { InstructorsController } from './instructors.controller';
import { InstructorsService } from './instructors.service';

@Module({
  imports: [AuthModule, ChatClientModule],
  controllers: [InstructorsController],
  providers: [InstructorsService],
})
export class InstructorsModule {}
