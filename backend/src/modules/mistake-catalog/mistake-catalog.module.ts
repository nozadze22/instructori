import { Module } from '@nestjs/common';
import { AdminMistakeCatalogController } from './admin-mistake-catalog.controller';
import { MistakeCatalogController } from './mistake-catalog.controller';
import { MistakeCatalogService } from './mistake-catalog.service';

@Module({
  controllers: [MistakeCatalogController, AdminMistakeCatalogController],
  providers: [MistakeCatalogService],
  exports: [MistakeCatalogService],
})
export class MistakeCatalogModule {}
