import * as fs from 'fs';
import { randomUUID } from 'crypto';

import { Inject, Injectable } from '@nestjs/common';
import { Command } from 'nestjs-command';
import { parse } from 'csv-parse';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { Agency, Calendar, CalendarDate, Route, Stop, StopTime, Transfer, Translation, Trip } from '~entities';
import { TABLE_PROVIDERS } from '~core/providers/table.providers';

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
