/* eslint-disable @nx/enforce-module-boundaries */
import * as fs from 'fs';

import { Inject, Injectable } from '@nestjs/common';
import { parse } from 'csv-parse';
import { Repository } from 'typeorm';
import { Calendar, TABLE_PROVIDERS } from '@transportmap/database';
import { KafkaTopics } from '@transportmap/kafka-connector';
import BatchStream from 'batch-stream';

import { kafka } from '~core/instances/kafka.instance';

@Injectable()
export class CalendarStaticProducerService {
	constructor(@Inject(TABLE_PROVIDERS.CALENDAR_REPOSITORY) private calendarRepository: Repository<Calendar>) {}

	public async seed(temporaryIdentifier: string, importId: string): Promise<void> {
		if (!fs.existsSync(`${__dirname}/../../tmp/${temporaryIdentifier}/calendar.txt`)) {
			return;
		}
		
		const readStream = fs.createReadStream(`${__dirname}/../../tmp/${temporaryIdentifier}/calendar.txt`, 'utf-8');

		const parser = parse({
			columns: true,
			relax_column_count: true,
		});
		
		await this.calendarRepository.delete({
			importId,
		});

		const batch = new BatchStream({ size: 500 });
		readStream
			.pipe(parser)
			.pipe(batch)
			.on('data', (records) => {
				kafka.sendBatch({
					messages: records,
					topic: KafkaTopics.STATIC_IMPORT_CALENDAR,
					key: 'seed',
					headers: {
						action: 'seed',
						type: 'event',
						origin: process.env.KAFKA_ORIGIN,
						timestamp: (new Date()).toISOString(),
						topic: KafkaTopics.STATIC_IMPORT_CALENDAR,
						importId
					},
				});
		  });

		return new Promise((resolve) => {
			readStream.on('end', () => resolve())
		})
	}
}
