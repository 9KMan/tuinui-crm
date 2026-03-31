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
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Contacts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('contacts')
export class ContactsController {
  constructor(private contactsService: ContactsService) {}

  @Get()
  @ApiOperation({ summary: 'List all contacts with optional search and filters' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'take', required: false })
  @ApiQuery({ name: 'skip', required: false })
  async findAll(
    @Query('search') search?: string,
    @Query('companyId') companyId?: string,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    return this.contactsService.findAll({
      search,
      companyId,
      take: take ? parseInt(take) : undefined,
      skip: skip ? parseInt(skip) : undefined,
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create a new contact' })
  async create(@Body() dto: CreateContactDto, @CurrentUser() user: any) {
    return this.contactsService.create(dto, user.id);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search contacts by name, email, or phone' })
  @ApiQuery({ name: 'q', required: true })
  @ApiQuery({ name: 'take', required: false })
  async search(@Query('q') query: string, @Query('take') take?: string) {
    return this.contactsService.search(query, take ? parseInt(take) : undefined);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get contact by ID' })
  async findOne(@Param('id') id: string) {
    return this.contactsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update contact' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateContactDto,
    @CurrentUser() user: any,
  ) {
    return this.contactsService.update(id, dto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete contact' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.contactsService.remove(id, user.id);
  }

  @Get(':id/activities')
  @ApiOperation({ summary: 'Get contact activity timeline' })
  @ApiQuery({ name: 'take', required: false })
  @ApiQuery({ name: 'skip', required: false })
  async getActivities(
    @Param('id') id: string,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    return this.contactsService.getActivities(id, {
      take: take ? parseInt(take) : undefined,
      skip: skip ? parseInt(skip) : undefined,
    });
  }
}
