import { IsString, IsOptional, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum NoteTargetType {
  CONTACT = 'Contact',
  COMPANY = 'Company',
  DEAL = 'Deal',
  TASK = 'Task',
}

export class CreateNoteDto {
  @ApiProperty({ example: 'Follow up with client next week' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ example: 'CALL_SUMMARY' })
  @IsString()
  @IsOptional()
  noteType?: string;

  @ApiPropertyOptional({ example: 'Raw transcription text' })
  @IsString()
  @IsOptional()
  rawText?: string;

  @ApiProperty()
  @IsUUID()
  targetId: string;

  @ApiProperty({ enum: NoteTargetType, example: NoteTargetType.CONTACT })
  @IsEnum(NoteTargetType)
  targetType: NoteTargetType;
}
