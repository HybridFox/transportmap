import { Controller, Get, Param } from '@nestjs/common';
import { Route } from '@transportmap/database';
import { ApiExcludeController } from '@nestjs/swagger';

import { RouteService } from '../services/route.service';

@Controller('v1/routes')
@ApiExcludeController()
export class RouteController {
	constructor(private readonly routeService: RouteService) {}

	@Get(':routeId')
	getAll(@Param('routeId') routeId: string): Promise<Route> {
		return this.routeService.getOne(routeId);
	}
}
