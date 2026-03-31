import { IsString, IsBoolean, IsOptional, IsArray, IsUrl } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWebhookDto {
  @IsString()
  name: string;

  @IsUrl()
  url: string;

  @IsString()
  @IsOptional()
  secret?: string;

  @IsArray()
  events: string[];

  @IsOptional()
  headers?: Record<string, string>;
}

export class UpdateWebhookDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsUrl()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  secret?: string;

  @IsArray()
  @IsOptional()
  events?: string[];

  @IsOptional()
  headers?: Record<string, string>;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
