import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NoteTargetType } from './dto/create-note.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Notes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notes')
export class NotesController {
  constructor(private notesService: NotesService) {}

  @Get()
  @ApiOperation({ summary: 'List all notes with optional target filters' })
  @ApiQuery({ name: 'targetType', required: false, enum: NoteTargetType })
  @ApiQuery({ name: 'targetId', required: false })
  async findAll(
    @Query('targetType') targetType?: NoteTargetType,
    @Query('targetId') targetId?: string,
  ) {
    return this.notesService.findAll({ targetType, targetId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get note by ID' })
  async findOne(@Param('id') id: string) {
    return this.notesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new note' })
  async create(@Body() dto: CreateNoteDto, @CurrentUser() user: { id: string }) {
    return this.notesService.create(dto, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a note' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateNoteDto,
  ) {
    return this.notesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a note' })
  async remove(@Param('id') id: string) {
    return this.notesService.remove(id);
  }
}
