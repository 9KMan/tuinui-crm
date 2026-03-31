import { IsString, IsArray, IsOptional } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  permissions: string[]; // e.g. ["contacts:read", "contacts:write", "deals:read"]
}

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  permissions?: string[];
}
