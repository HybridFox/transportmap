import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TABLE_PROVIDERS } from 'core/providers/table.providers';
import { Calendar, Stop, Trip } from 'core/entities';
import * as NodeCache from 'node-cache';
import * as dayjs from 'dayjs';
import { redis } from 'src/modules/core/instances/redis.instance';
import { calculateTripPositions } from '../helpers/trip.helpers';

@Injectable()
export class TripsService {
	private tripsCache: NodeCache;

	constructor(@Inject(TABLE_PROVIDERS.TRIP_REPOSITORY) private tripRepository: Repository<Trip>) {
		this.tripsCache = new NodeCache({ stdTTL: 5 * 60, checkperiod: 5 });

		setInterval(this.calculatePositions.bind(this), 15_000);
	}

	private async calculatePositions(): Promise<void> {
		console.log('// ------------------------------------------------------');
		console.log('//');
		console.log('//');
		console.log('// Calculate train positions');
		console.log('//');
		console.log('//');
		console.log('// ------------------------------------------------------');
		console.time('CALC_TRIP_POS');
		const LineString = (await import('ol/geom/LineString.js')).default;
		const trips = await this.getAll();

		await redis.del('TRIPLOCATIONS');
		console.log('total trips', trips.length);
		let i = 0;
		await trips.reduce(async (acc, trip) => {
			await acc;

			const calculatedTrip = await calculateTripPositions(trip, LineString).catch(console.error);

			if (
				!calculatedTrip ||
				!calculatedTrip.sectionLocation.longitude ||
				!calculatedTrip.sectionLocation.latitude
			) {
				return;
			}

			i++;
			redis.set(`TRIPS:${trip.id}`, JSON.stringify(calculatedTrip));
			redis.geoadd(
				`TRIPLOCATIONS`,
				calculatedTrip.sectionLocation.longitude,
				calculatedTrip.sectionLocation.latitude,
				trip.id,
			);
			redis.expire(`TRIPS:${trip.id}`, 60);
		}, Promise.resolve());
		console.log('total finished trips', i);
		console.timeEnd('CALC_TRIP_POS');
	}

	public async getAll(): Promise<Trip[]> {
		console.time('RAWTRIPS');
		const rawTrips = await redis.get('RAWTRIPS');

		(async () => {
			const rawTripsLastRefresh = await redis.get('RAWTRIPSLASTREFRESH');
			if (Number(rawTripsLastRefresh || '0') > dayjs(new Date()).unix()) {
				return;
			}

			console.log('FETCH OG TRIPS!!!!');
			console.time('trips');
			redis.set('RAWTRIPSLASTREFRESH', dayjs(new Date()).add(60, 'minutes').unix().toString());
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

			redis.set('RAWTRIPS', JSON.stringify(trips));
			console.timeEnd('trips');
		})();

		console.timeEnd('RAWTRIPS');
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
