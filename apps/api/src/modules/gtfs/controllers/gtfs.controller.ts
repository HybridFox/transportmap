import { Controller, Post } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

import { StaticStaticProducerService } from '../services/static-producer.service';

@ApiExcludeController()
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
