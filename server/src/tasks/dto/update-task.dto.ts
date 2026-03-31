import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsObject,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TaskPriority, TaskStatus, LinkedEntityType } from '@prisma/client';

export class UpdateTaskDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  reminderAt?: string;

  @ApiPropertyOptional({ enum: TaskPriority })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiPropertyOptional({ enum: TaskStatus })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  assigneeId?: string;

  @ApiPropertyOptional({ enum: LinkedEntityType })
  @IsEnum(LinkedEntityType)
  @IsOptional()
  linkedType?: LinkedEntityType;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  linkedId?: string;

  @ApiPropertyOptional({ type: Object })
  @IsObject()
  @IsOptional()
  recurring?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  completedAt?: string;
}
