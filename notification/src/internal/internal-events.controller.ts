import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  AccessPendingDto,
  InstructorMessageCreatedDto,
  InstructorRegistrationDto,
  InstructorReviewCreatedDto,
  StudentLinkedDto,
  StudentRegistrationDto,
  SystemRouteDto,
} from '../dto/internal-events.dto';
import { NotificationsService } from '../notifications.service';
import { InternalSecretGuard } from './internal-secret.guard';

@Controller('internal/events')
@UseGuards(InternalSecretGuard)
export class InternalEventsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Post('instructor-review-created')
  instructorReviewCreated(@Body() dto: InstructorReviewCreatedDto) {
    return this.notifications.createFromInstructorReview({
      reviewId: dto.reviewId,
      instructorId: dto.instructorId,
      studentId: dto.studentId,
      studentFullName: dto.studentFullName,
      rating: dto.rating,
      comment: dto.comment ?? null,
    });
  }

  @Post('instructor-message-created')
  instructorMessageCreated(@Body() dto: InstructorMessageCreatedDto) {
    return this.notifications.createFromInstructorMessage(dto);
  }

  @Post('instructor-registration')
  instructorRegistration(@Body() dto: InstructorRegistrationDto) {
    return this.notifications.createFromInstructorRegistration(dto);
  }

  @Post('access-pending')
  accessPending(@Body() dto: AccessPendingDto) {
    return this.notifications.createAccessPending(dto);
  }

  @Post('student-linked')
  studentLinked(@Body() dto: StudentLinkedDto) {
    return this.notifications.createFromStudentLinked(dto);
  }

  @Post('student-registration')
  studentRegistration(@Body() dto: StudentRegistrationDto) {
    return this.notifications.createFromStudentRegistration(dto);
  }

  @Post('system-route')
  systemRoute(@Body() dto: SystemRouteDto) {
    return this.notifications.createFromSystemRoute({
      routeId: dto.routeId,
      title: dto.title,
      city: dto.city ?? null,
      action: dto.action,
      createdCount: dto.createdCount,
      updatedCount: dto.updatedCount,
    });
  }
}
