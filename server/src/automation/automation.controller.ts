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
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AutomationService } from './automation.service';
import { CreateAutomationDto, UpdateAutomationDto } from './dto';

@ApiTags('automations')
@Controller('automations')
@UseGuards(JwtAuthGuard)
export class AutomationController {
  constructor(private readonly service: AutomationService) {}

  @Post()
  create(@Body() dto: CreateAutomationDto, @Req() req: Request & { user?: { id: string } }) {
    return this.service.create(dto, req.user?.id);
  }

  @Get()
  findAll(@Query('activeOnly') activeOnly?: string) {
    return this.service.findAll(activeOnly === 'true');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAutomationDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/toggle')
  toggle(@Param('id') id: string) {
    return this.service.toggle(id);
  }

  @Post(':id/test')
  triggerTest(
    @Param('id') id: string,
    @Body() testData?: Record<string, unknown>,
  ) {
    return this.service.triggerTest(id, testData);
  }

  @Get(':id/logs')
  getLogs(@Param('id') id: string, @Query('limit') limit?: string) {
    return this.service.getLogs(id, limit ? Number(limit) : 20);
  }
}
