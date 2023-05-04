import { Controller, Get, Param, Query } from '@nestjs/common';
import { CompositionService } from '../services/composition.service';
import { GeoService } from '../services/geo.service';
import { TripsService } from '../services/trips.service';
import { redis } from '../../../modules/core/instances/redis.instance';
import { Trip } from 'core/entities';

@Controller('v1/trips')
export class TripsController {
	constructor(
		private readonly tripsService: TripsService,
		private readonly compositionService: CompositionService,
		private readonly geoService: GeoService,
	) {}

	@Get()
	public async getAll(@Query('q') q: string): Promise<Trip[]> {
		return this.tripsService.search(q);
	}

	@Get(':tripId')
	public async getOne(@Param('tripId') tripId: string): Promise<any> {
		// const trip = await this.tripsService.getOne(tripId);
		const rawTrip = await redis.get(`TRIPS:NMBS/SNCB:${tripId}`);
		const trip = JSON.parse(rawTrip);

		const composition = await this.compositionService.getCachedComposition(trip.name);
		// const preciseRoute = await this.geoService.getPreciseRoute(trip.stopTimes);

		// Calculate the guessed progress of each trip.
		// TODO: is it possible to calculate this in a materialized view maybe?
		return {
			...trip,
			// stopTimes: trip.stopTimes.map((stopTime) => {
			// 	const { latitude, longitude } = this.geoService.projectLocation(
			// 		stopTime.stop.latitude,
			// 		stopTime.stop.longitude,
			// 	);

			// 	return {
			// 		...stopTime,
			// 		stop: {
			// 			...stopTime.stop,
			// 			projectedLatitude: latitude,
			// 			projectedLongitude: longitude,
			// 		},
			// 	};
			// }),
			composition,
			// preciseRoute,
		};
	}
}
