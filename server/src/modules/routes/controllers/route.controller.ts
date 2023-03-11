import { Controller, Get, Param, Query } from '@nestjs/common';
import { Route } from 'core/entities';
import { RouteService } from '../services/route.service';

@Controller('v1/routes')
export class RouteController {
	constructor(private readonly routeService: RouteService) {}

	@Get(':routeId')
	getAll(@Param('routeId') routeId: string): Promise<Route> {
		return this.routeService.getOne(routeId);
	}
}
