import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TABLE_PROVIDERS } from 'core/providers/table.providers';
import { Stop } from 'core/entities';
import * as dayjs from 'dayjs';

@Injectable()
export class StopsService {
	constructor(@Inject(TABLE_PROVIDERS.STOP_REPOSITORY) private stopRepository: Repository<Stop>) {}

	public async getOne(stopId: string): Promise<Stop> {
		return this.stopRepository
			.createQueryBuilder('stop')
			.where({ id: stopId })
			.leftJoinAndSelect('stop.stopTimes', 'stopTime', 'stopTime.arrivalTime > :time', {
				time: dayjs().format('HH:mm:ss'),
			})
			.leftJoinAndSelect('stopTime.trip', 'trip')
			.leftJoinAndSelect('trip.route', 'route')
			.getOne();
	}
}
