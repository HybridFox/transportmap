import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import dayjs from 'dayjs';
import { Stop, TABLE_PROVIDERS } from '@transportmap/database';

@Injectable()
export class StopsService {
	constructor(@Inject(TABLE_PROVIDERS.STOP_REPOSITORY) private stopRepository: Repository<Stop>) {}

	public async search(searchQuery: Record<string, string>): Promise<Stop[]> {
		const query = this.stopRepository
			.createQueryBuilder('stop')
			.where("(stop.platformCode = '') IS NOT FALSE")
			.leftJoinAndSelect('stop.translations', 'translations')

		// .andWhere(`calendar.${dayjs().format('dddd').toLowerCase()} = '1'`)
		// .getOne();

		// console.log(query.getSql(), query.getParameters());
		// console.log(await query.getRawOne())

		return query.getMany();
	}

	public async getOne(stopId: string): Promise<Stop> {
		const query = this.stopRepository
			.createQueryBuilder('stop')
			.leftJoinAndSelect('stop.stopTimes', 'stopTime', 'stopTime.departureTime > :time', {
				time: dayjs().format('HH:mm:ss'),
			})
			.leftJoinAndSelect('stopTime.trip', 'trip')
			.leftJoinAndSelect('trip.calendar', 'calendar')
			.leftJoinAndSelect('trip.route', 'route')
			.leftJoinAndSelect('trip.calendarDates', 'calendarDates')
			.where('stop.id = :stopId', { stopId })
			.andWhere('calendar.startDate < :startDate', { startDate: dayjs().format('YYYYMMDD') })
			.andWhere('calendar.endDate > :endDate', { endDate: dayjs().format('YYYYMMDD') })
			.andWhere((qb) =>
				qb
					.where('calendarDates.date = :today', { today: dayjs().format('YYYYMMDD') })
					.orWhere('calendarDates.date = :today', { today: dayjs().add(1, 'day').format('YYYYMMDD') }),
			)
			.andWhere(`calendarDates.exceptionType = '1'`)
			.orderBy('stopTime.departureTime');
		// .andWhere(`calendar.${dayjs().format('dddd').toLowerCase()} = '1'`)
		// .getOne();

		// console.log(query.getSql(), query.getParameters());
		// console.log(await query.getRawOne())

		return query.getOne();
	}
}
