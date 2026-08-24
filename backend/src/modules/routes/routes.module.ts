import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PublicRoutesController } from './public-routes.controller';
import { RoutesController } from './routes.controller';
import { RoutesService } from './routes.service';
import { TtsService } from './tts.service';

@Module({
  imports: [AuthModule],
  controllers: [RoutesController, PublicRoutesController],
  providers: [RoutesService, TtsService],
  exports: [RoutesService],
})
export class RoutesModule {}
