import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { EXAM_CITY_NAMES } from '../../routes/exam-cities';

export class MistakeNoteItemDto {
  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @IsOptional()
  @IsString()
  severityId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class CreateMistakeNoteDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  studentName!: string;

  @IsUUID()
  routeId!: string;

  @IsString()
  @IsIn(EXAM_CITY_NAMES)
  city!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => MistakeNoteItemDto)
  mistakes!: MistakeNoteItemDto[];

  @IsOptional()
  @IsDateString()
  practicedAt?: string;
}

export class UpdateMistakeNoteDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  studentName?: string;

  @IsOptional()
  @IsUUID()
  routeId?: string;

  @IsOptional()
  @IsString()
  @IsIn(EXAM_CITY_NAMES)
  city?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => MistakeNoteItemDto)
  mistakes?: MistakeNoteItemDto[];

  @IsOptional()
  @IsDateString()
  practicedAt?: string;
}
