import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import type { AccessSource, AccessStatus } from '../dto/auth-types';

export class AdminLoginDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class AdminCreateDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  fullName?: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class UpdateUserAccessDto {
  @IsIn(['PENDING', 'ACTIVE', 'BLOCKED'])
  accessStatus!: AccessStatus;

  @IsOptional()
  @IsIn(['ADMIN', 'PAYMENT'])
  accessSource?: AccessSource;
}
