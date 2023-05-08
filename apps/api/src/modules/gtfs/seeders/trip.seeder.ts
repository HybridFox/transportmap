import * as fs from 'fs';

import { Inject, Injectable } from '@nestjs/common';
import { parse } from 'csv-parse';
import { Repository } from 'typeorm';
import * as async from 'async';
import * as cliProgress from 'cli-progress';

import { TABLE_PROVIDERS } from '~core/providers/table.providers';
import { Trip } from '~entities';

@Injectable()
export class TripSeederService {
	constructor(@Inject(TABLE_PROVIDERS.TRIP_REPOSITORY) private tripRepository: Repository<Trip>) {}

	public async seed(temporaryIdentifier: string, agencyId: string) {
		const routeCsv = fs.readFileSync(`${__dirname}/../../tmp/${temporaryIdentifier}/trips.txt`, 'utf-8');
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
				format: '[SEED] {TRIP} {bar} {percentage}% | ETA: {eta}s | {value}/{total}',
				barCompleteChar: '\u2588',
				barIncompleteChar: '\u2591',
			},
		);

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
						agencyId,
					})),
				);

				progressBar.increment(records.length);
				callback();
			},
			5,
			500,
		);

		console.log('[SEED] {TRIP} truncate table');
		await this.tripRepository.delete({
			agencyId,
		});

		console.log('[SEED] {TRIP} queue records');
		for await (const record of parser) {
			q.push(record);
		}

		console.log('[SEED] {TRIP} down the drain');
		progressBar.start(q.length(), 0);
		await q.drain();
		progressBar.stop();
		console.log('[SEED] {TRIP} sink empty');
	}
}
