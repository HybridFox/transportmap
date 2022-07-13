import { Controller, Get, Param, Query } from '@nestjs/common';

import { VehicleService } from '../services/vehicle.service';

import { VehicleDocument } from '~schemas/vehicle.schema';

@Controller('v1/vehicles')
export class VehicleController {
	constructor(private readonly vehicleService: VehicleService) {}

	@Get()
	getAll(
		@Query('north') north: string,
		@Query('west') west: string,
		@Query('south') south: string,
		@Query('east') east: string,
	): Promise<VehicleDocument[]> {
		return this.vehicleService.getAll({
			north: Number(north),
			west: Number(west),
			south: Number(south),
			east: Number(east),
		});
	}

	@Get(':uuid')
	getOne(@Param('uuid') uuid: string): Promise<any> {
		return this.vehicleService.getOne(uuid);
	}
}
