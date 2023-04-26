import { Inject, Injectable } from '@nestjs/common';
import { parse } from 'csv-parse';
import * as fs from 'fs';
import { CalendarDate } from 'core/entities';
import { Repository } from 'typeorm';
import { TABLE_PROVIDERS } from 'core/providers/table.providers';
import * as async from 'async';

@Injectable()
export class CalendarDateSeederService {
	constructor(
		@Inject(TABLE_PROVIDERS.CALENDAR_DATE_REPOSITORY) private calendarDateRepository: Repository<CalendarDate>,
	) {}

	public async seed(temporaryIdentifier: string, agencyId: string) {
		const routeCsv = fs.readFileSync(
			`${__dirname}/../../../../tmp/${temporaryIdentifier}/calendar_dates.txt`,
			'utf-8',
		);
		const parser = parse(routeCsv, {
			columns: true,
			relax_column_count: true,
		});

		const q = async.cargoQueue(
			async (records: any[], callback) => {
				await this.calendarDateRepository.insert(
					records.map((record) => ({
						serviceId: record.service_id,
						date: record.date,
						exceptionType: record.exception_type,
						agencyId,
					})),
				);

				callback();
			},
			5,
			500,
		);

		console.log('[SEED] {CALENDAR_DATE} truncate table');
		await this.calendarDateRepository.delete({
			agencyId,
		});

		console.log('[SEED] {CALENDAR_DATE} queue records');
		for await (const record of parser) {
			q.push(record);
		}

		console.log('[SEED] {CALENDAR_DATE} down the drain');
		await q.drain();
		console.log('[SEED] {CALENDAR_DATE} sink empty');
	}
}
