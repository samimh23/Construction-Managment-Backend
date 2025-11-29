import { IsString, IsNotEmpty, IsEnum, IsOptional, IsArray, IsDateString, IsNumber, Min, Max, IsMongoId } from 'class-validator';
import { TaskStatus, TaskPriority } from '../schemas/task.schema';
import { Type } from 'class-transformer';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsMongoId()
  @IsNotEmpty()
  constructionSiteId: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  assignedWorkers?: string[];

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  progressPercentage?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  estimatedHours?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
