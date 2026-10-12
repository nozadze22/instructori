import {
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class CreateDrivingSessionDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  studentName!: string;

  @IsUUID()
  routeId!: string;

  @IsOptional()
  @IsUUID()
  studentUserId?: string;
}

export class CreateDrivingMistakeDto {
  @IsUUID()
  categoryId!: string;

  @IsLatitude()
  latitude!: number;

  @IsLongitude()
  longitude!: number;

  @IsOptional()
  @IsUUID()
  severityId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class UpdateDrivingMistakeDto {
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsUUID()
  severityId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
