import { Controller, Get, Post, Body, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Activities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('activities')
export class ActivitiesController {
  constructor(private activitiesService: ActivitiesService) {}

  @Get()
  @ApiOperation({ summary: 'List activities with optional filters' })
  @ApiQuery({ name: 'linkedType', required: false })
  @ApiQuery({ name: 'linkedId', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'take', required: false })
  @ApiQuery({ name: 'skip', required: false })
  async findAll(
    @Query('linkedType') linkedType?: string,
    @Query('linkedId') linkedId?: string,
    @Query('type') type?: string,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    return this.activitiesService.findAll({
      linkedType,
      linkedId,
      type,
      take: take ? parseInt(take) : undefined,
      skip: skip ? parseInt(skip) : undefined,
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create an activity entry' })
  async create(@Body() dto: CreateActivityDto, @CurrentUser() user: any) {
    return this.activitiesService.create(dto, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get activity by ID' })
  async findOne(@Param('id') id: string) {
    return this.activitiesService.findOne(id);
  }
}
