import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MistakeNotesController } from './mistake-notes.controller';
import { MistakeNotesService } from './mistake-notes.service';

@Module({
  imports: [AuthModule],
  controllers: [MistakeNotesController],
  providers: [MistakeNotesService],
})
export class MistakeNotesModule {}
