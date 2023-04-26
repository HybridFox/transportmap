import { Inject, Injectable } from '@nestjs/common';
import { parse } from 'csv-parse';
import * as fs from 'fs';
import { Calendar } from 'core/entities';
import { Repository } from 'typeorm';
import { TABLE_PROVIDERS } from 'core/providers/table.providers';
import * as async from 'async';

@Injectable()
export class CalendarSeederService {
	constructor(@Inject(TABLE_PROVIDERS.CALENDAR_REPOSITORY) private calendarRepository: Repository<Calendar>) {}

	public async seed(temporaryIdentifier: string, agencyId: string) {
		const routeCsv = fs.readFileSync(`${__dirname}/../../../../tmp/${temporaryIdentifier}/calendar.txt`, 'utf-8');
		const parser = parse(routeCsv, {
			columns: true,
			relax_column_count: true,
		});

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
		await q.drain();
		console.log('[SEED] {CALENDAR} sink empty');
	}
}
