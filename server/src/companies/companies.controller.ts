import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Companies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('companies')
export class CompaniesController {
  constructor(private companiesService: CompaniesService) {}

  @Get()
  @ApiOperation({ summary: 'List all companies with optional filters' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'industry', required: false })
  @ApiQuery({ name: 'size', required: false })
  @ApiQuery({ name: 'take', required: false })
  @ApiQuery({ name: 'skip', required: false })
  async findAll(
    @Query('search') search?: string,
    @Query('industry') industry?: string,
    @Query('size') size?: string,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    return this.companiesService.findAll({
      search,
      industry,
      size,
      take: take ? parseInt(take) : undefined,
      skip: skip ? parseInt(skip) : undefined,
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create a new company' })
  async create(@Body() dto: CreateCompanyDto, @CurrentUser() user: any) {
    return this.companiesService.create(dto, user.id);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search companies by name or domain' })
  @ApiQuery({ name: 'q', required: true })
  @ApiQuery({ name: 'take', required: false })
  async search(@Query('q') query: string, @Query('take') take?: string) {
    return this.companiesService.search(query, take ? parseInt(take) : undefined);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get company by ID' })
  async findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update company' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCompanyDto,
    @CurrentUser() user: any,
  ) {
    return this.companiesService.update(id, dto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete company' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.companiesService.remove(id, user.id);
  }
}
