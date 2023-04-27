import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TABLE_PROVIDERS } from 'core/providers/table.providers';
import { Agency, Calendar, GTFSProcessStatus, Stop, Trip } from 'core/entities';
import * as NodeCache from 'node-cache';
import * as dayjs from 'dayjs';
import { redis } from 'src/modules/core/instances/redis.instance';
import { calculateTripPositions } from '../helpers/trip.helpers';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class TripsService {
	private tripsCache: NodeCache;

	constructor(
		@Inject(TABLE_PROVIDERS.TRIP_REPOSITORY) private tripRepository: Repository<Trip>,
		@Inject(TABLE_PROVIDERS.AGENCY_REPOSITORY) private agencyRepository: Repository<Agency>,
		@Inject(TABLE_PROVIDERS.GTFS_PROCESS_STATUS) private gtfsProcessStatus: Repository<GTFSProcessStatus>,
	) {
		this.tripsCache = new NodeCache({ stdTTL: 5 * 60, checkperiod: 5 });
	}

	@Cron('*/15 * * * * *')
	public async calculatePositions(): Promise<void> {
		console.log('[POSITIONS] start calculation');
		const LineString = (await import('ol/geom/LineString.js')).default;

		const agencies = await this.agencyRepository.find();

		await redis.del('TRIPLOCATIONS');
		agencies.forEach(async (agency) => {
			const gtfsProcessStatus = await this.gtfsProcessStatus.findOneBy({ key: agency.id });
			if (!gtfsProcessStatus) {
				return console.log(`[POSITIONS] cancelling calculating positions for ${agency.id} since a row is not found`);
			}

			if (gtfsProcessStatus.processingRealtimeData === true || gtfsProcessStatus.processingStaticData === true) {
				return console.log(`[POSITIONS] cancelling calculating positions for ${agency.id} since there is a process running`);
			}

			const trips = await this.getAll(agency.id);

			let i = 0;
			await trips.reduce(async (acc, trip) => {
				await acc;

				const calculatedTrip = await calculateTripPositions(trip, LineString).catch(console.error);

				if (!calculatedTrip || !calculatedTrip.sectionLocation.longitude || !calculatedTrip.sectionLocation.latitude) {
					return;
				}

				i++;
				redis.set(`TRIPS:${agency.id}:${trip.id}`, JSON.stringify(calculatedTrip));
				redis.geoadd(`TRIPLOCATIONS`, calculatedTrip.sectionLocation.longitude, calculatedTrip.sectionLocation.latitude, trip.id);
				redis.expire(`TRIPS:${agency.id}:${trip.id}`, 60);
			}, Promise.resolve());
			console.log(`[POSITIONS] {${agency.id}} calculation done, got ${i} trips rendered to redis`);
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
				.andWhere('trip.agencyId = :agencyId', { agencyId })
				.andWhere('calendar.startDate < :startDate', { startDate: dayjs().format('YYYYMMDD') })
				.andWhere('calendar.endDate > :endDate', { endDate: dayjs().format('YYYYMMDD') })
				.andWhere('calendarDate.date = :today', { today: dayjs().format('YYYYMMDD') })
				.andWhere(`calendarDate.exceptionType = '1'`)
				.getMany();

			redis.set(`RAWTRIPS:${agencyId}`, JSON.stringify(trips));
		})();

		return JSON.parse(rawTrips || '[]');
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
