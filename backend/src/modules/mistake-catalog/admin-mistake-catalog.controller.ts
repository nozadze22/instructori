import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth_guard/auth_guard';
import { RolesGuard } from '../auth/auth_guard/guard';
import { Roles } from '../auth/auth_guard/roles.decorator';
import {
  CreateMistakeCategoryDto,
  CreateMistakeSeverityDto,
  UpdateMistakeCategoryDto,
  UpdateMistakeSeverityDto,
} from './dto/mistake-catalog.dto';
import { MistakeCatalogService } from './mistake-catalog.service';

@Controller('admin/mistake-catalog')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminMistakeCatalogController {
  constructor(private readonly catalog: MistakeCatalogService) {}

  @Get('categories')
  listCategories() {
    return this.catalog.listCategoriesForAdmin();
  }

  @Post('categories')
  createCategory(@Body() dto: CreateMistakeCategoryDto) {
    return this.catalog.createCategory(dto);
  }

  @Patch('categories/:id')
  updateCategory(@Param('id') id: string, @Body() dto: UpdateMistakeCategoryDto) {
    return this.catalog.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id') id: string) {
    return this.catalog.deleteCategory(id);
  }

  @Get('severities')
  listSeverities() {
    return this.catalog.listSeveritiesForAdmin();
  }

  @Post('severities')
  createSeverity(@Body() dto: CreateMistakeSeverityDto) {
    return this.catalog.createSeverity(dto);
  }

  @Patch('severities/:id')
  updateSeverity(@Param('id') id: string, @Body() dto: UpdateMistakeSeverityDto) {
    return this.catalog.updateSeverity(id, dto);
  }

  @Delete('severities/:id')
  deleteSeverity(@Param('id') id: string) {
    return this.catalog.deleteSeverity(id);
  }
}
