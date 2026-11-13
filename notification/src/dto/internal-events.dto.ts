import {
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class InstructorReviewCreatedDto {
  @IsUUID()
  reviewId!: string;

  @IsUUID()
  instructorId!: string;

  @IsUUID()
  studentId!: string;

  @IsString()
  studentFullName!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsOptional()
  @IsString()
  comment?: string | null;
}

export class InstructorMessageCreatedDto {
  @IsUUID()
  messageId!: string;

  @IsUUID()
  instructorId!: string;

  @IsUUID()
  studentId!: string;

  @IsString()
  studentFullName!: string;

  @IsString()
  messagePreview!: string;
}

export class InstructorRegistrationDto {
  @IsUUID()
  userId!: string;

  @IsString()
  fullName!: string;

  @IsString()
  email!: string;

  @IsString()
  city!: string;

  @IsArray()
  @IsUUID('4', { each: true })
  adminRecipientIds!: string[];
}

export class AccessPendingDto {
  @IsUUID()
  userId!: string;

  @IsString()
  fullName!: string;
}

export class ChatRequestAcceptedDto {
  @IsUUID()
  studentId!: string;

  @IsUUID()
  instructorId!: string;

  @IsString()
  instructorFullName!: string;
}

export class StudentLinkedDto {
  @IsUUID()
  instructorId!: string;

  @IsUUID()
  studentId!: string;

  @IsString()
  studentFullName!: string;
}

export class StudentRegistrationDto {
  @IsUUID()
  studentId!: string;

  @IsString()
  studentFullName!: string;

  @IsOptional()
  @IsUUID()
  instructorId?: string | null;

  @IsArray()
  @IsUUID('4', { each: true })
  adminRecipientIds!: string[];
}

export class SystemRouteDto {
  @IsUUID()
  routeId!: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  city?: string | null;

  @IsIn(['created', 'updated', 'catalog_sync'])
  action!: 'created' | 'updated' | 'catalog_sync';

  @IsOptional()
  @IsInt()
  @Min(0)
  createdCount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  updatedCount?: number;

  @IsArray()
  @IsUUID('4', { each: true })
  instructorRecipientIds!: string[];
}

export class SystemMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  body!: string;

  @IsUUID()
  adminUserId!: string;

  @IsArray()
  @IsUUID('4', { each: true })
  recipientUserIds!: string[];
}
