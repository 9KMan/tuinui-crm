import { IsString, IsOptional, IsEnum, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContactCompanySize } from '@prisma/client';

export class UpdateCompanyDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  domain?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  industry?: string;

  @ApiPropertyOptional({ enum: ['STARTUP', 'SMB', 'MID', 'ENTERPRISE'] })
  @IsEnum(['STARTUP', 'SMB', 'MID', 'ENTERPRISE'] as const)
  @IsOptional()
  size?: ContactCompanySize;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  logo?: string;

  @ApiPropertyOptional({ type: Object })
  @IsObject()
  @IsOptional()
  customFields?: Record<string, any>;
}
