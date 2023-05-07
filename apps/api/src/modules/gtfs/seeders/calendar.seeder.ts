import * as fs from 'fs';

import { Inject, Injectable } from '@nestjs/common';
import { parse } from 'csv-parse';
import { Repository } from 'typeorm';
import * as async from 'async';
import * as cliProgress from 'cli-progress';

import { TABLE_PROVIDERS } from '~core/providers/table.providers';
import { Calendar } from '~entities';

@Injectable()
export class CalendarSeederService {
	constructor(@Inject(TABLE_PROVIDERS.CALENDAR_REPOSITORY) private calendarRepository: Repository<Calendar>) {}

	public async seed(temporaryIdentifier: string, agencyId: string) {
		const routeCsv = fs.readFileSync(`${__dirname}/../../../../tmp/${temporaryIdentifier}/calendar.txt`, 'utf-8');
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
				format: '[SEED] {CALENDAR} {bar} {percentage}% | ETA: {eta}s | {value}/{total}',
				barCompleteChar: '\u2588',
				barIncompleteChar: '\u2591',
			},
		);

		const q = async.cargoQueue(
			async (records: any[], callback) => {
				await this.calendarRepository.insert(
					records.map((record) => ({
						serviceId: record.service_id,
						monday: record.monday,
						tuesday: record.tuesday,
						wednesday: record.wednesday,
						thursday: record.thursday,
						friday: record.friday,
						saturday: record.saturday,
						sunday: record.sunday,
						startDate: record.start_date,
						endDate: record.end_date,
						agencyId,
					})),
				);

				progressBar.increment(records.length);
				callback();
			},
			5,
			500,
		);

		console.log('[SEED] {CALENDAR} truncate table');
		await this.calendarRepository.delete({
			agencyId,
		});

		console.log('[SEED] {CALENDAR} queue records');
		for await (const record of parser) {
			q.push(record);
		}

		console.log('[SEED] {CALENDAR} down the drain');
		progressBar.start(q.length(), 0);
		await q.drain();
		progressBar.stop();
		console.log('[SEED] {CALENDAR} sink empty');
	}
}
