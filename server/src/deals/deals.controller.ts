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
import { DealsService } from './deals.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Deals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('deals')
export class DealsController {
  constructor(private dealsService: DealsService) {}

  @Get()
  @ApiOperation({ summary: 'List all deals with pagination and filters' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'pipelineStageId', required: false })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'assignedToId', required: false })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('pipelineStageId') pipelineStageId?: string,
    @Query('companyId') companyId?: string,
    @Query('assignedToId') assignedToId?: string,
  ) {
    return this.dealsService.findAll({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      pipelineStageId,
      companyId,
      assignedToId,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get deal by ID' })
  async findOne(@Param('id') id: string) {
    return this.dealsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new deal' })
  async create(@Body() dto: CreateDealDto, @CurrentUser() user: { id: string }) {
    return this.dealsService.create(dto, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update deal' })
  async update(@Param('id') id: string, @Body() dto: UpdateDealDto) {
    return this.dealsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete deal' })
  async remove(@Param('id') id: string) {
    return this.dealsService.remove(id);
  }
}
