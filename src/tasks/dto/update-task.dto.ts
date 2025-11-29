import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';
import { IsDateString, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @IsDateString()
  @IsOptional()
  completedDate?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  actualHours?: number;
}
