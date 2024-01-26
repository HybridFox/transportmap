import {Controller, Get, Param, Query} from '@nestjs/common';
import {CalculatedTrip, Stop} from '@transportmap/database';
import {ApiExcludeController, ApiOkResponse, ApiOperation, ApiQuery} from '@nestjs/swagger';

import { StopsService } from '../services/stops.service';
import { OAStop } from "@transportmap/openapi";

@ApiExcludeController()
@Controller('v1/stops')
export class StopsController {
	constructor(private readonly stopsService: StopsService) {}

	@Get()
	@ApiOperation({ summary: 'Fetch multiple stops' })
	@ApiQuery({ name: 'north', type: Number, description: 'Bounding box north', required: false })
	@ApiQuery({ name: 'east', type: Number, description: 'Bounding box east', required: false })
	@ApiQuery({ name: 'south', type: Number, description: 'Bounding box south', required: false })
	@ApiQuery({ name: 'west', type: Number, description: 'Bounding box west', required: false })
	@ApiQuery({ name: 'q', type: String, description: 'Search query (searches on name, headsign, route.name and route.routeCode)', required: false })
	@ApiOkResponse({ type: OAStop, isArray: true })
	public async search(@Query() query: Record<string, string>): Promise<Partial<Stop>[]> {
		return this.stopsService.search(query);
	}

	@Get(':stopId')
	getAll(@Param('stopId') stopId: string): Promise<Stop> {
		return this.stopsService.getOne(stopId);
	}
}
