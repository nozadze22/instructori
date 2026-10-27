import {
  IsNotEmpty,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateInstructorVehicleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  @IsIn(['MANUAL', 'AUTOMATIC'])
  @MaxLength(40)
  tag?: string;

}

export class UpdateInstructorVehicleDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  @IsIn(['MANUAL', 'AUTOMATIC'])
  @MaxLength(40)
  tag?: string;

}
