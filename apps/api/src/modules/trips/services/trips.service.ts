import { Inject, Injectable } from '@nestjs/common';
import { MongoRepository, Repository } from 'typeorm';
import NodeCache from 'node-cache';
import dayjs from 'dayjs';
import { Cron } from '@nestjs/schedule';
import { Agency, CalculatedTrip, GTFSStaticStatus, Trip, TABLE_PROVIDERS, mongoDataSource } from '@transportmap/database';
import { pick } from 'ramda';

import { redis } from '~core/instances/redis.instance';
import { LoggingService } from '~core/services/logging.service';

import { calculateTripPositions } from '../helpers/trip.helpers';

@Injectable()
export class TripsService {
	private tripsCache: NodeCache;
	private tripCacheRepository: MongoRepository<CalculatedTrip>;

	constructor(
		@Inject(TABLE_PROVIDERS.TRIP_REPOSITORY) private tripRepository: Repository<Trip>,
		@Inject(TABLE_PROVIDERS.AGENCY_REPOSITORY) private agencyRepository: Repository<Agency>,
		@Inject(TABLE_PROVIDERS.GTFS_STATIC_STATUS) private gtfsStaticStatus: Repository<GTFSStaticStatus>,
		private readonly loggingService: LoggingService,
	) {
		this.tripsCache = new NodeCache({ stdTTL: 5 * 60, checkperiod: 5 });
		this.tripCacheRepository = mongoDataSource.getMongoRepository(CalculatedTrip);
	}

	@Cron('*/15 * * * * *')
	public async calculatePositions(): Promise<void> {
		console.log('[POSITIONS] start calculation');
		// const LineString = (await import('ol/geom/LineString.js')).default;

		const agencies = await this.agencyRepository.find();

		const allKeys = (await this.tripCacheRepository.find({
			select: ['id']
		})).map(({ id }) => id);
		agencies.forEach(async (agency) => {
			const gtfsStaticStatus = await this.gtfsStaticStatus.findOneBy({ key: agency.id });
			if (!gtfsStaticStatus) {
				return console.log(`[POSITIONS] cancelling calculating positions for ${agency.id} since a row is not found`);
			}

			if (gtfsStaticStatus.processingStaticData === true) {
				return console.log(`[POSITIONS] cancelling calculating positions for ${agency.id} since there is a process running`);
			}

			const trips = await this.getAll(agency.id);

			let i = 0;
			const leftoverKeys = await trips.reduce(async (acc, trip) => {
				const keys = await acc;

				const calculatedTrip = await calculateTripPositions(trip, this.loggingService).catch(console.error);

				if (!calculatedTrip || !calculatedTrip.sectionLocation.longitude || !calculatedTrip.sectionLocation.latitude) {
					return keys;
				}

				i++;

				await this.tripCacheRepository.findOneAndUpdate({ id: trip.id }, {
					$set: {
						...calculatedTrip
					}
				}, {
					upsert: true
				})

				return keys.filter((key) => key !== trip.id);
			}, Promise.resolve(allKeys));

			if (leftoverKeys.length) {
				await this.tripCacheRepository.deleteMany({
					id: {
						$in: leftoverKeys
					}
				})
			}

			console.log(`[POSITIONS] {${agency.id}} calculation done, got ${i} trips rendered to redis, ${leftoverKeys.length} keys removed`);
		});
	}

	public async getAll(agencyId: string): Promise<Trip[]> {
		const rawTrips = await redis.get(`RAWTRIPS:${agencyId}`);

		(async () => {
			const rawTripsLastRefresh = await redis.get(`RAWTRIPSLASTREFRESH:${agencyId}`);
			if (Number(rawTripsLastRefresh || '0') > dayjs(new Date()).unix()) {
				return;
			}

			console.log(`[TRIPS] ${agencyId} refetching from database`);
			redis.set(`RAWTRIPSLASTREFRESH:${agencyId}`, dayjs(new Date()).add(1, 'minutes').unix().toString());
			const trips = await this.tripRepository
				.createQueryBuilder('trip')
				.leftJoinAndSelect('trip.stopTimes', 'stopTime')
				.leftJoinAndSelect('stopTime.stop', 'stop')
				.leftJoinAndSelect('trip.calendar', 'calendar')
				.leftJoinAndSelect('trip.route', 'route')
				.leftJoinAndSelect('trip.calendarDates', 'calendarDate')
				.andWhere('calendar.startDate < :startDate', { startDate: dayjs().format('YYYYMMDD') })
				.andWhere('calendar.endDate > :endDate', { endDate: dayjs().format('YYYYMMDD') })
				.andWhere('calendarDate.date = :today', { today: dayjs().format('YYYYMMDD') })
				.andWhere(`calendarDate.exceptionType = '1'`)
				.getMany();

			redis.set(`RAWTRIPS:${agencyId}`, JSON.stringify(trips));
		})();

		return JSON.parse(rawTrips || '[]');
	}

	public async search(query: Record<string, string>): Promise<Partial<CalculatedTrip>[]> {
		if (query.q && query.q.length < 3) {
			return []
		}
		
		const match = new RegExp(query.q, "i");
		const trips = await this.tripCacheRepository.find({
			limit: 10,
			where: {
				...(query.q && {
					$or: [
						{ name: { $regex: match } },
						{ headsign: { $regex: match } },
						{ 'route.name': { $regex: match } },
						{ 'route.routeCode': { $regex: match } },
					]
				}),
				...(query.west && query.north && query.east && query.south && {
					'sectionLocation': { $geoWithin: { $box:  [ [Number(query.west), Number(query.north)], [Number(query.east), Number(query.south)] ] } }
				})
			},
		})

		return trips.map((trip) => pick(['osrmRoute', 'route', 'sections', 'id', 'name'])(trip))
	}

	public async getOne(tripId: string): Promise<Trip> {
		const cachedTrips: string = this.tripsCache.get(`trips:${tripId}`);
		if (cachedTrips) {
			return JSON.parse(cachedTrips);
		}

		const trip = await this.tripRepository
			.createQueryBuilder('trip')
			.leftJoinAndSelect('trip.stopTimes', 'stopTime')
			.leftJoinAndSelect('stopTime.stop', 'stop')
			.leftJoinAndSelect('trip.calendar', 'calendar')
			.leftJoinAndSelect('trip.route', 'route')
			.leftJoinAndSelect('trip.calendarDates', 'calendarDate')
			.andWhere('calendar.startDate < :startDate', { startDate: dayjs().format('YYYYMMDD') })
			.andWhere('calendar.endDate > :endDate', { endDate: dayjs().format('YYYYMMDD') })
			.andWhere('calendarDate.date = :today', { today: dayjs().format('YYYYMMDD') })
			.andWhere(`calendarDate.exceptionType = '1'`)
			.andWhere(`trip.id = :tripId`, { tripId })
			.getOne();
		// .andWhere('stopTime.arrivalTime > :arrivalTime', { arrivalTime: dayjs().subtract(1, 'hour').format('HH:mm:ss') })
		// .andWhere('stopTime.departureTime < :departureTime', { departureTime: dayjs().add(1, 'hour').format('HH:mm:ss') })
		// .andWhere('stopTime.')
		// .orderBy('stopTime.departureTime')

		// return query.getMany();

		this.tripsCache.set(`trips:${tripId}`, JSON.stringify(trip));

		return trip;
	}
}
