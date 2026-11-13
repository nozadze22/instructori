import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  AccessPendingDto,
  ChatRequestAcceptedDto,
  InstructorMessageCreatedDto,
  InstructorRegistrationDto,
  InstructorReviewCreatedDto,
  StudentLinkedDto,
  StudentRegistrationDto,
  SystemMessageDto,
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
    return this.notifications.createFromInstructorRegistration({
      userId: dto.userId,
      fullName: dto.fullName,
      email: dto.email,
      city: dto.city,
      adminRecipientIds: dto.adminRecipientIds,
    });
  }

  @Post('access-pending')
  accessPending(@Body() dto: AccessPendingDto) {
    return this.notifications.createAccessPending(dto);
  }

  @Post('student-linked')
  studentLinked(@Body() dto: StudentLinkedDto) {
    return this.notifications.createFromStudentLinked(dto);
  }

  @Post('chat-request-accepted')
  chatRequestAccepted(@Body() dto: ChatRequestAcceptedDto) {
    return this.notifications.createFromChatRequestAccepted(dto);
  }

  @Post('student-registration')
  studentRegistration(@Body() dto: StudentRegistrationDto) {
    return this.notifications.createFromStudentRegistration({
      studentId: dto.studentId,
      studentFullName: dto.studentFullName,
      instructorId: dto.instructorId,
      adminRecipientIds: dto.adminRecipientIds,
    });
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
      instructorRecipientIds: dto.instructorRecipientIds,
    });
  }

  @Post('system-message')
  systemMessage(@Body() dto: SystemMessageDto) {
    return this.notifications.createFromSystemMessage({
      title: dto.title,
      body: dto.body,
      adminUserId: dto.adminUserId,
      recipientUserIds: dto.recipientUserIds,
    });
  }
}
