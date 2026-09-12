import { IsBoolean } from 'class-validator';

export class UpdateExamRegionDto {
  @IsBoolean()
  isActive!: boolean;
}
