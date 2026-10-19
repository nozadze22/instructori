import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth_guard/auth_guard';
import { MistakeCatalogService } from './mistake-catalog.service';

@Controller('mistake-catalog')
@UseGuards(JwtAuthGuard)
export class MistakeCatalogController {
  constructor(private readonly catalog: MistakeCatalogService) {}

  @Get('categories')
  listCategories() {
    return this.catalog.listActiveCategories();
  }

  @Get('severities')
  listSeverities() {
    return this.catalog.listActiveSeverities();
  }
}
