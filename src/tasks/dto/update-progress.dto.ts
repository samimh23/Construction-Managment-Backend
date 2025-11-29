import { IsNumber, Min, Max, IsString, IsOptional } from 'class-validator';

export class UpdateProgressDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  progressPercentage: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
