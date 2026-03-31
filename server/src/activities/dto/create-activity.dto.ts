import { IsString, IsOptional, IsEnum, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityType, LinkedEntityType } from '@prisma/client';

export class CreateActivityDto {
  @ApiProperty({ enum: ['EMAIL', 'CALL', 'NOTE', 'TASK', 'EVENT', 'CUSTOM', 'CREATE', 'UPDATE', 'DELETE'] })
  @IsEnum([
    'EMAIL', 'CALL', 'NOTE', 'TASK', 'EVENT', 'CUSTOM', 'CREATE', 'UPDATE', 'DELETE',
  ] as const)
  type: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  body?: string;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiProperty({ enum: ['CONTACT', 'COMPANY', 'DEAL', 'TASK', 'EVENT', 'NONE'] })
  @IsEnum(['CONTACT', 'COMPANY', 'DEAL', 'TASK', 'EVENT', 'NONE'] as const)
  linkedType: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  linkedId?: string;
}
