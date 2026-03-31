import { IsString, IsBoolean, IsOptional, IsArray, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAutomationDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  triggerType: 'RECORD_CREATED' | 'RECORD_UPDATED' | 'RECORD_DELETED' | 'FIELD_CHANGED' | 'SCHEDULE' | 'WEBHOOK';

  @IsObject()
  triggerConfig: Record<string, unknown>;

  @IsArray()
  @IsOptional()
  conditions?: Array<{ field: string; operator: string; value: unknown }>;

  @IsArray()
  actions: Array<{ type: string; config: Record<string, unknown> }>;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateAutomationDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  triggerType?: 'RECORD_CREATED' | 'RECORD_UPDATED' | 'RECORD_DELETED' | 'FIELD_CHANGED' | 'SCHEDULE' | 'WEBHOOK';

  @IsObject()
  @IsOptional()
  triggerConfig?: Record<string, unknown>;

  @IsArray()
  @IsOptional()
  conditions?: Array<{ field: string; operator: string; value: unknown }>;

  @IsArray()
  @IsOptional()
  actions?: Array<{ type: string; config: Record<string, unknown> }>;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
