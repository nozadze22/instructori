import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateIf,
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

export const ADMIN_EMAIL_AUDIENCES = [
  'ALL',
  'INSTRUCTORS',
  'USERS',
  'SELECTED',
] as const;

export type AdminEmailAudience = (typeof ADMIN_EMAIL_AUDIENCES)[number];

export class AdminBroadcastEmailDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  subject!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20_000)
  body!: string;

  @IsIn(ADMIN_EMAIL_AUDIENCES)
  audience!: AdminEmailAudience;

  @ValidateIf((dto: AdminBroadcastEmailDto) => dto.audience === 'SELECTED')
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  userIds?: string[];
}
