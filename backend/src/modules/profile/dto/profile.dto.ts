import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
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
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  workingHours?: string;

  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== '')
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(9999)
  hourlyRate?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  packageDeal?: string | null;

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
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  workingHours?: string;

  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== '')
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(9999)
  hourlyRate?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  packageDeal?: string | null;

  @IsOptional()
  @IsArray()
  @IsEnum(INSTRUCTOR_CATEGORIES, { each: true })
  instructorCategories?: string[];
}

export class JoinInstructorDto {
  @Transform(({ value }: { value: unknown }): unknown =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-F0-9]{8}$/, {
    message: 'ინსტრუქტორის კოდი 8 ასო-რიცხვი უნდა იყოს (მაგ. A1B2C3D4)',
  })
  instructorCode!: string;
}

export class CreateInstructorCodeDto {
  @IsOptional()
  @IsBoolean()
  rotate?: boolean;
}
