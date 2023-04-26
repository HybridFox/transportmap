import { Inject, Injectable } from '@nestjs/common';
import { parse } from 'csv-parse';
import * as fs from 'fs';
import { StopTime } from 'core/entities';
import { Repository } from 'typeorm';
import { TABLE_PROVIDERS } from 'core/providers/table.providers';
import * as async from 'async';

@Injectable()
export class StopTimeOverrideSeederService {
	constructor(@Inject(TABLE_PROVIDERS.STOP_TIME_REPOSITORY) private stopTimeRepository: Repository<StopTime>) {}

	public async seed(temporaryIdentifier: string, agencyId: string) {
		const routeCsv = fs.readFileSync(
			`${__dirname}/../../../../tmp/${temporaryIdentifier}/stop_time_overrides.txt`,
			'utf-8',
		);

		if (!routeCsv) {
			return console.log('[SEED] {STOP_TIME_OVERRIDES} no overrides found');
		}

		const parser = parse(routeCsv, {
			columns: true,
			relax_column_count: true,
		});

		const q = async.queue(async (record: any, callback) => {
			await this.stopTimeRepository.update(
				{
					tripId: record.trip_id,
					stopSequence: record.stop_sequence,
					agencyId,
				},
				{
					stopId: record.stop_id,
				},
			);

			callback();
		}, 25);

		console.log('[SEED] {STOP_TIME_OVERRIDES} queue records');
		for await (const record of parser) {
			q.push(record);
		}

		console.log('[SEED] {STOP_TIME_OVERRIDES} down the drain');
		await q.drain();
		console.log('[SEED] {STOP_TIME_OVERRIDES} sink empty');
	}
}
