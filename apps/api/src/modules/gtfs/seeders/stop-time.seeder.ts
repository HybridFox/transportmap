import * as fs from 'fs';

import { Inject, Injectable } from '@nestjs/common';
import { parse } from 'csv-parse';
import { Repository } from 'typeorm';
import * as async from 'async';
import * as cliProgress from 'cli-progress';

import { TABLE_PROVIDERS } from '~core/providers/table.providers';
import { StopTime } from '~entities';

@Injectable()
export class StopTimeSeederService {
	constructor(@Inject(TABLE_PROVIDERS.STOP_TIME_REPOSITORY) private stopTimeRepository: Repository<StopTime>) {}

	public async seed(temporaryIdentifier: string, agencyId: string) {
		const routeCsv = fs.readFileSync(`${__dirname}/../../tmp/${temporaryIdentifier}/stop_times.txt`, 'utf-8');
		const parser = parse(routeCsv, {
			columns: true,
			relax_column_count: true,
		});
		const progressBar = new cliProgress.SingleBar(
			{
				fps: 30,
				forceRedraw: true,
				noTTYOutput: true,
				notTTYSchedule: 1000,
			},
			{
				format: '[SEED] {STOP_TIMES} {bar} {percentage}% | ETA: {eta}s | {value}/{total}',
				barCompleteChar: '\u2588',
				barIncompleteChar: '\u2591',
			},
		);

		const q = async.cargoQueue(
			async (records: any[], callback) => {
				await this.stopTimeRepository.insert(
					records.map((record) => ({
						id: `${record.trip_id}_${record.stop_sequence}`,
						tripId: record.trip_id,
						arrivalTime: record.arrival_time,
						departureTime: record.departure_time,
						stopId: record.stop_id,
						stopSequence: record.stop_sequence,
						stopHeadsign: record.stop_headsign,
						pickupType: record.pickup_type,
						dropOffType: record.drop_off_type,
						shapeDistTraveled: record.shape_dist_traveled,
						agencyId,
					})),
				);

				progressBar.increment(records.length);
				callback();
			},
			5,
			500,
		);

		console.log('[SEED] {STOP_TIMES} truncate table');
		await this.stopTimeRepository.delete({
			agencyId,
		});

		console.log('[SEED] {STOP_TIMES} queue records');
		for await (const record of parser) {
			q.push(record);
		}

		console.log('[SEED] {STOP_TIMES} down the drain');
		progressBar.start(q.length(), 0);
		await q.drain();
		progressBar.stop();
		console.log('[SEED] {STOP_TIMES} sink empty');
	}
}
