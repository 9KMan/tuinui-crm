import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CustomFieldsService } from './custom-fields.service';
import { CreateCustomFieldDto, UpdateCustomFieldDto } from './dto';

@ApiTags('custom-fields')
@Controller('custom-fields')
@UseGuards(JwtAuthGuard)
export class CustomFieldsController {
  constructor(private readonly service: CustomFieldsService) {}

  @Post()
  create(@Body() dto: CreateCustomFieldDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query('entityType') entityType?: string) {
    return this.service.findAll(entityType);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCustomFieldDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  // Values sub-resource
  @Post('values/:entityType/:entityId')
  setValues(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Body() values: Record<string, unknown>,
  ) {
    return this.service.setValues(entityType, entityId, values);
  }

  @Get('values/:entityType/:entityId')
  getValues(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.service.getValues(entityType, entityId);
  }
}
