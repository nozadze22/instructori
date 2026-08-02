import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { EXAM_CITY_NAMES } from '../exam-cities';

export enum RouteVisibilityDto {
  SYSTEM = 'SYSTEM',
  PRIVATE = 'PRIVATE',
}

export enum RouteActionDto {
  TURN_LEFT = 'TURN_LEFT',
  TURN_RIGHT = 'TURN_RIGHT',
  STOP = 'STOP',
  PARKING = 'PARKING',
  REVERSE = 'REVERSE',
  U_TURN = 'U_TURN',
  CUSTOM = 'CUSTOM',
}

export class RouteTtsDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  text!: string;
}

export class RoutePathPointDto {
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat!: number;
}

export class CreateRouteStepDto {
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng!: number;

  @IsEnum(RouteActionDto)
  action!: RouteActionDto;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(5000)
  distanceBeforeVoice?: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  voiceText?: string;

  @IsOptional()
  @IsUrl()
  audioUrl?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  order?: number;
}

export class CreateRouteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  @IsIn(EXAM_CITY_NAMES)
  city?: string;

  @IsOptional()
  @IsEnum(RouteVisibilityDto)
  visibility?: RouteVisibilityDto;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoutePathPointDto)
  path?: RoutePathPointDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRouteStepDto)
  steps?: CreateRouteStepDto[];
}

export class UpdateRouteDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsString()
  @IsIn(EXAM_CITY_NAMES)
  city?: string | null;

  @IsOptional()
  @IsEnum(RouteVisibilityDto)
  visibility?: RouteVisibilityDto;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoutePathPointDto)
  path?: RoutePathPointDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRouteStepDto)
  steps?: CreateRouteStepDto[];
}

export class CreateStepDto {
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng!: number;

  @IsEnum(RouteActionDto)
  action!: RouteActionDto;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(5000)
  distanceBeforeVoice?: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  voiceText?: string;

  @IsOptional()
  @IsUrl()
  audioUrl?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  order?: number;
}

export class UpdateStepDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng?: number;

  @IsOptional()
  @IsEnum(RouteActionDto)
  action?: RouteActionDto;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(5000)
  distanceBeforeVoice?: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  voiceText?: string | null;

  @IsOptional()
  @IsUrl()
  audioUrl?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  order?: number;
}

export class ReorderStepsDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  stepIds!: string[];
}
