import { Controller, Post } from '@nestjs/common';

import { StaticStaticProducerService } from '../services/static-producer.service';

@Controller('v1/gtfs')
export class GtfsController {
	constructor(
		private readonly staticProducerService: StaticStaticProducerService
	) {}

	@Post('/static-sync')
	public async staticSync(): Promise<any> {
		this.staticProducerService.seedStatic()
	}
}
