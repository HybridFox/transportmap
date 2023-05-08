import { Controller, Post } from '@nestjs/common';

import { StaticSeederService } from '../services/static-seeder.service';

@Controller('v1/gtfs')
export class GtfsController {
	constructor(
		private readonly staticSeederService: StaticSeederService
	) {}

	@Post('/static-sync')
	public async staticSync(): Promise<any> {
		this.staticSeederService.seedStatic()
	}
}
