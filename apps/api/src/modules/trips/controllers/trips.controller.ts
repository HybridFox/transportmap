import { Controller, Get, Param, Post, Query } from '@nestjs/common';

import { CalculatedTrip, Trip } from '~entities';

import { CompositionService } from '../services/composition.service';
import { TripsService } from '../services/trips.service';
import { MongoRepository } from 'typeorm';
import { mongoDataSource } from '~core/providers/database.providers';

@Controller('v1/trips')
export class TripsController {
	private tripCacheRepository: MongoRepository<CalculatedTrip>;

	constructor(
		private readonly tripsService: TripsService,
		private readonly compositionService: CompositionService
	) {
		this.tripCacheRepository = mongoDataSource.getMongoRepository(CalculatedTrip);
	}

	@Get()
	public async getAll(@Query('q') q: string): Promise<CalculatedTrip[]> {
		return this.tripsService.search(q);
	}

	@Get(':tripId')
	public async getOne(@Param('tripId') tripId: string): Promise<any> {
		// const trip = await this.tripsService.getOne(tripId);
		const trip = await this.tripCacheRepository.findOne({ where: { 
			id: tripId
		} });
		
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
