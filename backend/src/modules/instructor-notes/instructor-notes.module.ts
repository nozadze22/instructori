import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { InstructorNotesController } from './instructor-notes.controller';
import { InstructorNotesService } from './instructor-notes.service';

@Module({
  imports: [AuthModule],
  controllers: [InstructorNotesController],
  providers: [InstructorNotesService],
})
export class InstructorNotesModule {}
