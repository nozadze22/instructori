import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

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
