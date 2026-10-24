import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MistakeCatalogModule } from '../mistake-catalog/mistake-catalog.module';
import { MistakeNotesController } from './mistake-notes.controller';
import { MistakeNotesService } from './mistake-notes.service';

@Module({
  imports: [AuthModule, MistakeCatalogModule],
  controllers: [MistakeNotesController],
  providers: [MistakeNotesService],
})
export class MistakeNotesModule {}
