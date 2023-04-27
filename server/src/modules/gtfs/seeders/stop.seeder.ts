import { Inject, Injectable } from '@nestjs/common';
import { parse } from 'csv-parse';
import * as fs from 'fs';
import { Stop } from 'core/entities';
import { Repository } from 'typeorm';
import { TABLE_PROVIDERS } from 'core/providers/table.providers';
import * as async from 'async';
import * as cliProgress from 'cli-progress';

@Injectable()
export class StopSeederService {
	constructor(@Inject(TABLE_PROVIDERS.STOP_REPOSITORY) private stopRepository: Repository<Stop>) {}

	public async seed(temporaryIdentifier: string, agencyId: string) {
		const routeCsv = fs.readFileSync(`${__dirname}/../../../../tmp/${temporaryIdentifier}/stops.txt`, 'utf-8');
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
				format: '[SEED] {STOP} {bar} {percentage}% | ETA: {eta}s | {value}/{total}',
				barCompleteChar: '\u2588',
				barIncompleteChar: '\u2591',
			},
		);

		const q = async.cargoQueue(
			async (records: any[], callback) => {
				await this.stopRepository.insert(
					records.map((record) => ({
						id: record.stop_id,
						code: record.stop_code,
						name: record.stop_name,
						description: record.stop_desc,
						latitude: record.stop_lat,
						longitude: record.stop_lon,
						zoneId: record.zone_id,
						url: record.stop_url,
						locationType: record.location_type,
						parent_station: record.parentStationId,
						platformCode: record.platform_code,
						agencyId,
					})),
				);

				progressBar.increment(records.length);
				callback();
			},
			5,
			500,
		);

		console.log('[SEED] {STOP} truncate table');
		await this.stopRepository.delete({
			agencyId,
		});

		console.log('[SEED] {STOP} queue records');
		for await (const record of parser) {
			q.push(record);
		}

		console.log('[SEED] {STOP} down the drain');
		progressBar.start(q.length(), 0);
		await q.drain();
		progressBar.stop();
		console.log('[SEED] {STOP} sink empty');
	}
}
