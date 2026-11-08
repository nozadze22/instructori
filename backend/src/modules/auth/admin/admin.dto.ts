import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
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

export class BroadcastSystemMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  body!: string;
}
