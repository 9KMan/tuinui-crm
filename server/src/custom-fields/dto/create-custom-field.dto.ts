import { IsString, IsBoolean, IsOptional, IsNumber, IsArray } from 'class-validator';
import { PartialType } from '@nestjs/swagger';

export class CreateCustomFieldDto {
  @IsString()
  name: string; // kebab-case: "github-url"

  @IsString()
  label: string; // "GitHub URL"

  @IsString()
  type: 'TEXT' | 'NUMBER' | 'DATE' | 'BOOLEAN' | 'SELECT' | 'MULTISELECT';

  @IsBoolean()
  @IsOptional()
  required?: boolean;

  @IsArray()
  @IsOptional()
  options?: string[]; // For SELECT/MULTISELECT

  @IsString()
  entityType: 'CONTACT' | 'COMPANY' | 'DEAL' | 'TASK' | 'EVENT';

  @IsNumber()
  @IsOptional()
  position?: number;
}

export class UpdateCustomFieldDto extends PartialType(CreateCustomFieldDto) {}
