import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';
import { INSTRUCTOR_CATEGORIES } from '../../auth/dto/auth.dto';

export class CreateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  workingHours?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(INSTRUCTOR_CATEGORIES, { each: true })
  instructorCategories?: string[];

}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  fullName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  workingHours?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(INSTRUCTOR_CATEGORIES, { each: true })
  instructorCategories?: string[];

}

export class JoinInstructorDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  instructorCode!: string;
}
