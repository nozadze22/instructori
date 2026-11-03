import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class CreateInstructorNoteDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  studentName!: string;

  @IsOptional()
  @IsUUID()
  studentUserId?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  body!: string;

  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== '')
  @IsDateString()
  nextSessionAt?: string | null;
}

export class UpdateInstructorNoteDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  studentName?: string;

  @IsOptional()
  @IsUUID()
  studentUserId?: string | null;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  body?: string;

  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== '')
  @IsDateString()
  nextSessionAt?: string | null;
}

export class InstructorNoteQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  studentName?: string;

  @IsOptional()
  @IsUUID()
  studentUserId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  q?: string;

  @IsOptional()
  @IsIn(['newest', 'oldest'])
  sort?: 'newest' | 'oldest';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  pageSize?: number;

  @IsOptional()
  @Type(() => String)
  @IsString()
  upcomingOnly?: string;
}

export class InstructorNoteStudentsQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  q?: string;

  @IsOptional()
  @IsIn(['recent', 'most-notes', 'name-asc', 'name-desc'])
  sort?: 'recent' | 'most-notes' | 'name-asc' | 'name-desc';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  pageSize?: number;
}
