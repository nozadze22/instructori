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
} from 'class-validator';
import { EXAM_CITY_NAMES } from '../../routes/exam-cities';

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
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @MaxLength(500, { each: true })
  mistakes!: string[];

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
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @MaxLength(500, { each: true })
  mistakes?: string[];

  @IsOptional()
  @IsDateString()
  practicedAt?: string;
}
