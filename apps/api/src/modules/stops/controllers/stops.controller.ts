import { Controller, Get, Param } from '@nestjs/common';

import { Stop } from '@transportmap/database';

import { StopsService } from '../services/stops.service';

@Controller('v1/stops')
export class StopsController {
	constructor(private readonly stopsService: StopsService) {}

	@Get(':stopId')
	getAll(@Param('stopId') stopId: string): Promise<Stop> {
		return this.stopsService.getOne(stopId);
	}
}
