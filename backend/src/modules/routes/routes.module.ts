import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ExamRegionsController } from './exam-regions.controller';
import { ExamRegionsService } from './exam-regions.service';
import { PublicRoutesController } from './public-routes.controller';
import { RoutesController } from './routes.controller';
import { RoutesService } from './routes.service';
import { TtsService } from './tts.service';

@Module({
  imports: [AuthModule],
  controllers: [RoutesController, PublicRoutesController, ExamRegionsController],
  providers: [RoutesService, ExamRegionsService, TtsService],
  exports: [RoutesService, ExamRegionsService],
})
export class RoutesModule {}
