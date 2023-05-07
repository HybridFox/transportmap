import * as fs from 'fs';

import { Inject, Injectable } from '@nestjs/common';
import { parse } from 'csv-parse';
import { Repository } from 'typeorm';
import * as async from 'async';
import * as cliProgress from 'cli-progress';

import { TABLE_PROVIDERS } from '~core/providers/table.providers';
import { Route } from '~entities';

@Injectable()
export class RouteSeederService {
	constructor(@Inject(TABLE_PROVIDERS.ROUTE_REPOSITORY) private routeRepository: Repository<Route>) {}

	public async seed(temporaryIdentifier: string, agencyId: string) {
		const routeCsv = fs.readFileSync(`${__dirname}/../../../../tmp/${temporaryIdentifier}/routes.txt`, 'utf-8');
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
				format: '[SEED] {ROUTE} {bar} {percentage}% | ETA: {eta}s | {value}/{total}',
				barCompleteChar: '\u2588',
				barIncompleteChar: '\u2591',
			},
		);

		const q = async.cargoQueue(
			async (records: any[], callback) => {
				await this.routeRepository.insert(
					records.map((record) => ({
						id: record.route_id,
						agencyId: record.agency_id,
						routeCode: record.route_short_name,
						name: record.route_long_name,
						description: record.route_desc,
						type: record.route_type,
						url: record.route_url,
						color: record.route_color,
						textColor: record.route_text_color,
					})),
				);

				progressBar.increment(records.length);
				callback();
			},
			5,
			500,
		);

		console.log('[SEED] {ROUTE} truncate table');
		await this.routeRepository.delete({
			agencyId,
		});

		console.log('[SEED] {ROUTE} queue records');
		for await (const record of parser) {
			q.push(record);
		}

		console.log('[SEED] {ROUTE} down the drain');
		progressBar.start(q.length(), 0);
		await q.drain();
		progressBar.stop();
		console.log('[SEED] {ROUTE} sink empty');
	}
}
