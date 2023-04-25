import { Inject, Injectable } from '@nestjs/common';
import { parse } from 'csv-parse';
import * as fs from 'fs';
import { Trip } from 'core/entities';
import { Repository } from 'typeorm';
import { TABLE_PROVIDERS } from 'core/providers/table.providers';
import * as async from 'async';

@Injectable()
export class StopTimeSeederService {
	constructor(@Inject(TABLE_PROVIDERS.TRIP_REPOSITORY) private tripRepository: Repository<Trip>) {}

	public async seed(temporaryIdentifier: string) {
		const routeCsv = fs.readFileSync(`${__dirname}/../../../../tmp/${temporaryIdentifier}/stop_times.txt`, 'utf-8');
		const parser = parse(routeCsv, {
			columns: true,
			relax_column_count: true,
		});

		const q = async.cargoQueue(
			async (records: any[], callback) => {
				await this.tripRepository.insert(
					records.map((record) => ({
						id: record.trip_id,
						routeId: record.route_id,
						serviceId: record.service_id,
						headsign: record.trip_headsign,
						name: record.trip_short_name,
						directionId: record.direction_id,
						blockId: record.block_id,
						shapeId: record.shape_id,
						type: record.trip_type,
						agencyId: 'NMBS/SNCB',
					})),
				);

				callback();
			},
			5,
			500,
		);

		console.log('[SEED] {TRIP} truncate table');
		this.tripRepository.clear();

		console.log('[SEED] {TRIP} queue records');
		for await (const record of parser) {
			q.push(record);
		}

		console.log('[SEED] {TRIP} down the drain');
		await q.drain();
		console.log('[SEED] {TRIP} sink empty');
	}
}
