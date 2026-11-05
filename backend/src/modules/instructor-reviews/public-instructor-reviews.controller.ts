import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/auth_guard/current_user_decorator';
import { OptionalJwtAuthGuard } from '../auth/auth_guard/optional-jwt-auth.guard';
import type { AuthUser } from '../auth/dto/auth-types';
import { InstructorReviewQueryDto } from './dto/instructor-review.dto';
import { InstructorReviewsService } from './instructor-reviews.service';

@Controller('public/instructor-reviews')
export class PublicInstructorReviewsController {
  constructor(
    private readonly instructorReviewsService: InstructorReviewsService,
  ) {}

  @Get(':instructorId/summary')
  @UseGuards(OptionalJwtAuthGuard)
  summary(@Param('instructorId') instructorId: string) {
    return this.instructorReviewsService.getPublicSummary(instructorId);
  }

  @Get(':instructorId')
  @UseGuards(OptionalJwtAuthGuard)
  async list(
    @Param('instructorId') instructorId: string,
    @Query() query: InstructorReviewQueryDto,
    @CurrentUser() user?: AuthUser,
  ) {
    const result = await this.instructorReviewsService.listPublic(
      instructorId,
      {
        sort: query.sort,
        page: query.page,
        pageSize: query.pageSize,
      },
    );

    return {
      ...result,
      items: result.items.map((item) =>
        this.instructorReviewsService.withOwnFlag(item, user?.userId),
      ),
    };
  }
}
