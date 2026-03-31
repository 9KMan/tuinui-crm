import { IsString, IsOptional, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({ example: 'Team Meeting' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Weekly sync with the team' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '2026-04-01T10:00:00.000Z' })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({ example: '2026-04-01T11:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ example: 'Conference Room A' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ example: 'MEETING' })
  @IsString()
  @IsOptional()
  eventType?: string;

  @ApiPropertyOptional({ example: '#3B82F6' })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  assignedToId?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  contactId?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  companyId?: string;
}
