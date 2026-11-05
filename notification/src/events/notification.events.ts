export const NOTIFICATION_EVENTS = {
  INSTRUCTOR_REVIEW_CREATED: 'notification.instructor_review.created',
} as const;

export type InstructorReviewCreatedEvent = {
  reviewId: string;
  instructorId: string;
  studentId: string;
  studentFullName: string;
  rating: number;
  comment: string | null;
};
