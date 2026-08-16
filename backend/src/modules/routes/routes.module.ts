import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { RoutesController } from './routes.controller';
import { RoutesService } from './routes.service';
import { TtsService } from './tts.service';

@Module({
  imports: [AuthModule],
  controllers: [RoutesController],
  providers: [RoutesService, TtsService],
  exports: [RoutesService],
})
export class RoutesModule {}
