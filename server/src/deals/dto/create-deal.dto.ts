import {
  IsString,
  IsOptional,
  IsNumber,
  IsUUID,
  IsEnum,
  IsObject,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DealStage } from '@prisma/client';

export class CreateDealDto {
  @ApiProperty({ example: 'Enterprise SaaS Deal' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 50000 })
  @IsNumber()
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ enum: DealStage, example: DealStage.PROSPECT })
  @IsEnum(DealStage)
  @IsOptional()
  stage?: DealStage;

  @ApiPropertyOptional({ example: 20 })
  @IsNumber()
  @IsOptional()
  probability?: number;

  @ApiPropertyOptional({ example: '2026-06-30T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  expectedCloseDate?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  companyId?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  contactId?: string;

  @ApiPropertyOptional({ type: Object })
  @IsObject()
  @IsOptional()
  customFields?: Record<string, unknown>;
}
