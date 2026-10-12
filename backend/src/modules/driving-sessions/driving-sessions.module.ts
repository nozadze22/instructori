import { Module } from '@nestjs/common';

import { MistakeCatalogModule } from '../mistake-catalog/mistake-catalog.module';
import {
  DrivingSessionsController,
  StudentDrivingSessionsController,
} from './driving-sessions.controller';
import { DrivingSessionsService } from './driving-sessions.service';

@Module({
  imports: [MistakeCatalogModule],
  controllers: [DrivingSessionsController, StudentDrivingSessionsController],
  providers: [DrivingSessionsService],
})
export class DrivingSessionsModule {}
