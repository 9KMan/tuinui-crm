import {
  Controller,
  Get,
  Query,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Search')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Search across contacts, companies, deals, tasks, and notes' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query string' })
  @ApiQuery({ name: 'types', required: false, description: 'Comma-separated list of entity types to search (e.g. contacts,companies)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Max results per type (default: 10)' })
  async search(
    @Query('q') query: string,
    @Query('types') types?: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    const targetTypes = types
      ? types.split(',').map((t) => t.trim())
      : undefined;

    return this.searchService.search(query, { targetTypes, limit });
  }
}
