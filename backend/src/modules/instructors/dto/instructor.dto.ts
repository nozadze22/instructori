import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateInstructorMessageDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(1000)
  message!: string;
}
