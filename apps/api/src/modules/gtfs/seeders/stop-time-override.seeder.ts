import * as fs from 'fs';

import { Inject, Injectable } from '@nestjs/common';
import { parse } from 'csv-parse';
import { Repository } from 'typeorm';
import * as async from 'async';
import * as cliProgress from 'cli-progress';

import { TABLE_PROVIDERS } from '~core/providers/table.providers';
import { StopTime } from '~entities';

@Injectable()
export class StopTimeOverrideSeederService {
	constructor(@Inject(TABLE_PROVIDERS.STOP_TIME_REPOSITORY) private stopTimeRepository: Repository<StopTime>) {}

	public async seed(temporaryIdentifier: string, agencyId: string) {
		const routeCsv = fs.readFileSync(`${__dirname}/../../tmp/${temporaryIdentifier}/stop_time_overrides.txt`, 'utf-8');
		const progressBar = new cliProgress.SingleBar(
			{
				fps: 30,
				forceRedraw: true,
				noTTYOutput: true,
				notTTYSchedule: 1000,
			},
			{
				format: '[SEED] {STOP_TIME_OVERRIDES} {bar} {percentage}% | ETA: {eta}s | {value}/{total}',
				barCompleteChar: '\u2588',
				barIncompleteChar: '\u2591',
			},
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
					stopIdOverride: record.stop_id,
				},
			);

			progressBar.increment();
			callback();
		}, 250);

		console.log('[SEED] {STOP_TIME_OVERRIDES} queue records');
		for await (const record of parser) {
			q.push(record);
		}

		console.log('[SEED] {STOP_TIME_OVERRIDES} down the drain');
		progressBar.start(q.length(), 0);
		await q.drain();
		progressBar.stop();
		console.log('[SEED] {STOP_TIME_OVERRIDES} sink empty');
	}
}
