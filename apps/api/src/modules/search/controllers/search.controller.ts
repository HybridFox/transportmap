import { Controller, Get, Query } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

import { SearchService } from '../services/search.service';

@Controller('v1/search')
@ApiExcludeController()
export class SearchController {
	constructor(
		private readonly searchService: SearchService
	) {}

	@Get()
	public async getAll(@Query() query: Record<string, string>): Promise<any> {
		return this.searchService.search(query);
	}
}
