import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LinkedEntityType } from '@prisma/client';

export class CreateFileDto {
  @ApiProperty({ description: 'Original filename' })
  @IsString()
  filename: string;

  @ApiProperty({ description: 'MIME type (e.g. image/png, application/pdf)' })
  @IsString()
  mimeType: string;

  @ApiProperty({ description: 'File size in bytes' })
  @IsInt()
  @Min(0)
  size: number;

  @ApiPropertyOptional({ description: 'Public or signed URL for the file' })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiPropertyOptional({ description: 'Local file path (for server-side storage)' })
  @IsString()
  @IsOptional()
  localPath?: string;

  @ApiPropertyOptional({ description: 'ID of the entity this file is attached to' })
  @IsString()
  @IsOptional()
  targetId?: string;

  @ApiPropertyOptional({
    description: 'Type of entity this file is attached to',
    enum: LinkedEntityType,
  })
  @IsString()
  @IsOptional()
  targetType?: LinkedEntityType;
}
