import { Controller, Get, NotFoundException, Param, Post, Query } from '@nestjs/common';
import { CalculatedTrip, mongoDataSource } from '@transportmap/database';
import { MongoRepository } from 'typeorm';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { OACalculatedTrip, OAHttpError } from '@transportmap/openapi';

import { CompositionService } from '../services/composition.service';
import { TripsService } from '../services/trips.service';

@Controller('v1/trips')
@ApiTags('Trips')
@ApiNotFoundResponse({ type: OAHttpError })
export class TripsController {
	private tripCacheRepository: MongoRepository<CalculatedTrip>;

	constructor(private readonly tripsService: TripsService, private readonly compositionService: CompositionService) {
		this.tripCacheRepository = mongoDataSource.getMongoRepository(CalculatedTrip);
	}

	@Get()
	@ApiOperation({ summary: 'Fetch multiple strips' })
	@ApiQuery({ name: 'north', type: Number, description: 'Bounding box north', required: false })
	@ApiQuery({ name: 'east', type: Number, description: 'Bounding box east', required: false })
	@ApiQuery({ name: 'south', type: Number, description: 'Bounding box south', required: false })
	@ApiQuery({ name: 'west', type: Number, description: 'Bounding box west', required: false })
	@ApiQuery({ name: 'q', type: String, description: 'Search query (searches on name, headsign, route.name and route.routeCode)', required: false })
	@ApiOkResponse({ type: OACalculatedTrip, isArray: true })
	public async getAll(@Query() query: Record<string, string>): Promise<Partial<CalculatedTrip>[]> {
		return this.tripsService.search(query);
	}

	@Get(':tripId')
	@ApiOperation({ summary: 'Fetch single trip' })
	@ApiQuery({ name: 'skipComposition', type: Boolean, description: 'Skip populating the composition (this will significantly speed up the call if there is no cached composition)', required: false })
	@ApiOkResponse({ type: () => OACalculatedTrip })
	@ApiParam({ name: 'tripId', type: String, description: 'Can be in the following formats:\n- iRail (BE.NMBS.IC9539)\n- routeCode + name (IC9539)\n- name (IC9539)\n- GTFS (88____:007::8892007:8833605:31:1622:20231208)' })
	public async getOne(@Param('tripId') tripId: string, @Query('skipComposition') skipComposition = 'false'): Promise<any> {
		const [trip] = await this.tripCacheRepository.aggregate([
			{
				$project: {
					iRailID: { $concat: ['BE.NMBS.', '$route.routeCode', '$name'] },
					shortId: { $concat: ['$route.routeCode', '$name'] },
					route: 1,
					id: 1,
					bearing: 1,
					name: 1,
					sectionLocation: 1,
					sectionProgress: 1,
					sections: 1,
					speed: 1,
				}
			},
			{
				$match: {
					$or: [
						{ id: tripId },
						{ shortId: tripId },
						{ iRailID: tripId },
						{ name: tripId },
					]
				}
			}
		]).toArray();
		
		if (!trip) {
			throw new NotFoundException(`trip with identifier or name ${tripId} could not be found`);
		}

		if (skipComposition === 'true') {
			return trip;
		}

		const composition = await this.compositionService.getCachedComposition(trip.name);

		return {
			...trip,
			composition
		};
	}
}
