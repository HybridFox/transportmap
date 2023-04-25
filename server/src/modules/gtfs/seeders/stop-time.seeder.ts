import { Inject, Injectable } from '@nestjs/common';
import { parse } from 'csv-parse';
import * as fs from 'fs';
import { StopTime } from 'core/entities';
import { Repository } from 'typeorm';
import { TABLE_PROVIDERS } from 'core/providers/table.providers';
import * as async from 'async';

@Injectable()
export class StopTimeSeederService {
	constructor(@Inject(TABLE_PROVIDERS.STOP_TIME_REPOSITORY) private stopTimeRepository: Repository<StopTime>) {}

	public async seed(temporaryIdentifier: string) {
		const routeCsv = fs.readFileSync(`${__dirname}/../../../../tmp/${temporaryIdentifier}/stop_times.txt`, 'utf-8');
		const parser = parse(routeCsv, {
			columns: true,
			relax_column_count: true,
		});

		const q = async.cargoQueue(
			async (records: any[], callback) => {
				await this.stopTimeRepository.insert(
					records.map((record) => ({
						id: `${record.trip_id}_${record.arrival_time}_${record.departure_time}_${record.stop_id}`,
						tripId: record.trip_id,
						arrivalTime: record.arrival_time,
						departureTime: record.departure_time,
						stopId: record.stop_id,
						stopSequence: record.stop_sequence,
						stopHeadsign: record.stop_headsign,
						pickupType: record.pickup_type,
						dropOffType: record.drop_off_type,
						shapeDistTraveled: record.shape_dist_traveled,
						agencyId: 'NMBS/SNCB',
					})),
				);

				callback();
			},
			5,
			500,
		);

		console.log('[SEED] {STOP_TIMES} truncate table');
		this.stopTimeRepository.clear();

		console.log('[SEED] {STOP_TIMES} queue records');
		for await (const record of parser) {
			q.push(record);
		}

		console.log('[SEED] {STOP_TIMES} down the drain');
		await q.drain();
		console.log('[SEED] {STOP_TIMES} sink empty');
	}
}
