import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AccessGuard } from '../auth/auth_guard/access.guard';
import { JwtAuthGuard } from '../auth/auth_guard/auth_guard';
import { CurrentUser } from '../auth/auth_guard/current_user_decorator';
import { RolesGuard } from '../auth/auth_guard/guard';
import { Roles } from '../auth/auth_guard/roles.decorator';
import type { AuthUser } from '../auth/dto/auth-types';
import {
  CreateInstructorReviewDto,
  InstructorReviewQueryDto,
  UpdateInstructorReviewDto,
} from './dto/instructor-review.dto';
import { InstructorReviewsService } from './instructor-reviews.service';

@Controller('instructor-reviews')
@UseGuards(JwtAuthGuard, AccessGuard)
export class InstructorReviewsController {
  constructor(
    private readonly instructorReviewsService: InstructorReviewsService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('USER')
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateInstructorReviewDto) {
    return this.instructorReviewsService.create(user, dto);
  }

  @Get('received')
  @UseGuards(RolesGuard)
  @Roles('INSTRUCTOR')
  listReceived(
    @CurrentUser() user: AuthUser,
    @Query() query: InstructorReviewQueryDto,
  ) {
    return this.instructorReviewsService.listForInstructorAsOwner(user.userId, {
      sort: query.sort,
      page: query.page,
      pageSize: query.pageSize,
    });
  }

  @Get('for-instructor/:instructorId/mine')
  @UseGuards(RolesGuard)
  @Roles('USER')
  findMine(
    @CurrentUser() user: AuthUser,
    @Param('instructorId') instructorId: string,
  ) {
    return this.instructorReviewsService.findMineForInstructor(
      user,
      instructorId,
    );
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('USER')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateInstructorReviewDto,
  ) {
    return this.instructorReviewsService.update(user, id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('USER')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.instructorReviewsService.remove(user, id);
  }
}
