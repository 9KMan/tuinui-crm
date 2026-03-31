import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/create-file.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { LinkedEntityType } from '@prisma/client';

@ApiTags('Files')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get()
  @ApiOperation({ summary: 'List all files with optional filters and pagination' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'targetType', required: false })
  @ApiQuery({ name: 'targetId', required: false })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('targetType') targetType?: LinkedEntityType,
    @Query('targetId') targetId?: string,
  ) {
    const skip = (page - 1) * limit;
    return this.filesService.findAll({ targetType, targetId, take: limit, skip });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a file by ID' })
  async findOne(@Param('id') id: string) {
    return this.filesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create / register a new file' })
  async create(@Body() dto: CreateFileDto, @CurrentUser() user: { id: string }) {
    return this.filesService.create(dto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a file' })
  async remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.filesService.remove(id, user.id);
  }
}
