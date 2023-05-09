import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Route, TABLE_PROVIDERS } from '@transportmap/database';

type FileMap = Record<
	string,
	{
		repository: Repository<unknown>;
		columnMapping: Record<string, string>;
		requiresId?: boolean;
	}
>;

@Injectable()
export class RouteService {
	constructor(@Inject(TABLE_PROVIDERS.ROUTE_REPOSITORY) private routeRepository: Repository<Route>) {}

	public async getOne(routeId: string): Promise<Route> {
		return this.routeRepository
			.createQueryBuilder('route')
			.where({ id: routeId })
			.leftJoinAndSelect('route.trips', 'trip')
			.leftJoinAndSelect('trip.stopTimes', 'stopTime')
			.leftJoinAndSelect('stopTime.stop', 'stop')
			.getOne();
	}
}
