/* eslint-disable @nx/enforce-module-boundaries */
import * as fs from 'fs';

import { parse } from 'csv-parse';
import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CalendarDate, TABLE_PROVIDERS } from '@transportmap/database';
import BatchStream from 'batch-stream';
import { KafkaTopics } from '@transportmap/kafka-connector';

import { kafka } from '~core/instances/kafka.instance';

@Injectable()
export class CalendarDateStaticProducerService {
	constructor(@Inject(TABLE_PROVIDERS.CALENDAR_DATE_REPOSITORY) private calendarDateRepository: Repository<CalendarDate>) {}

	public async seed(temporaryIdentifier: string, importId: string): Promise<void> {
		if (!fs.existsSync(`${__dirname}/../../tmp/${temporaryIdentifier}/calendar_dates.txt`)) {
			return;
		}

		console.log(`[SEED] {${importId}} seeding calendar_dates`);
		const readStream = fs.createReadStream(`${__dirname}/../../tmp/${temporaryIdentifier}/calendar_dates.txt`, 'utf-8');

		const parser = parse({
			columns: true,
			relax_column_count: true,
		});
		
		await this.calendarDateRepository.delete({
			importId,
		});

		const batch = new BatchStream({ size: 500 });
		readStream
			.pipe(parser)
			.pipe(batch)
			.on('data', (records) => {
				kafka.sendBatch({
					messages: records,
					topic: KafkaTopics.STATIC_IMPORT_CALENDAR_DATE,
					key: 'seed',
					headers: {
						action: 'seed',
						type: 'event',
						origin: process.env.KAFKA_ORIGIN,
						timestamp: (new Date()).toISOString(),
						topic: KafkaTopics.STATIC_IMPORT_CALENDAR_DATE,
						importId
					},
				});
		  });

		return new Promise((resolve) => {
			readStream.on('end', () => resolve())
		})
	}
}
