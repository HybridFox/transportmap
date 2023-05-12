import { Controller, Get, Query } from '@nestjs/common';

import { SearchService } from '../services/search.service';

@Controller('v1/search')
export class SearchController {
	constructor(
		private readonly searchService: SearchService
	) {}

	@Get()
	public async getAll(@Query() query: Record<string, string>): Promise<any> {
		return this.searchService.search(query);
	}
}
