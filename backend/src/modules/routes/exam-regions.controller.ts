import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth_guard/auth_guard';
import { RolesGuard } from '../auth/auth_guard/guard';
import { Roles } from '../auth/auth_guard/roles.decorator';
import { UpdateExamRegionDto } from './dto/exam-region.dto';
import { ExamRegionsService } from './exam-regions.service';

@Controller('admin/regions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class ExamRegionsController {
  constructor(private readonly examRegionsService: ExamRegionsService) {}

  @Get()
  findAll() {
    return this.examRegionsService.findAllForAdmin();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateExamRegionDto) {
    return this.examRegionsService.setActive(id, dto.isActive);
  }
}
