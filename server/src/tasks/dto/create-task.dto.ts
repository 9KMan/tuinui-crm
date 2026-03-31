import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsObject,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskPriority, TaskStatus, LinkedEntityType } from '@prisma/client';

export class CreateTaskDto {
  @ApiProperty({ example: 'Follow up with client' })
  @IsString()
  title: string;

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
}
