import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateApiKeyDto {
  @IsString()
  name: string; // "Production Integration", "Zapier", etc.

  @IsDateString()
  @IsOptional()
  expiresAt?: string; // Optional expiry date
}
