import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { InstructorReviewsController } from './instructor-reviews.controller';
import { InstructorReviewsService } from './instructor-reviews.service';
import { PublicInstructorReviewsController } from './public-instructor-reviews.controller';

@Module({
  imports: [AuthModule],
  controllers: [InstructorReviewsController, PublicInstructorReviewsController],
  providers: [InstructorReviewsService],
  exports: [InstructorReviewsService],
})
export class InstructorReviewsModule {}
