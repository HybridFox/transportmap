/* eslint-disable @nx/enforce-module-boundaries */
import * as fs from 'fs';

import { Inject, Injectable } from '@nestjs/common';
import { parse } from 'csv-parse';
import { Repository } from 'typeorm';
import { StopTime, TABLE_PROVIDERS } from '@transportmap/database';
import BatchStream from 'batch-stream';
import { KafkaTopics } from '@transportmap/kafka-connector';

import { kafka } from '~core/instances/kafka.instance';

@Injectable()
export class StopTimeOverrideStaticProducerService {
	constructor(@Inject(TABLE_PROVIDERS.STOP_TIME_REPOSITORY) private stopTimeRepository: Repository<StopTime>) {}

	public async seed(temporaryIdentifier: string, importId: string): Promise<void> {
		if (!fs.existsSync(`${__dirname}/../../tmp/${temporaryIdentifier}/stop_time_overrides.txt`)) {
			return;
		}
		
		console.log(`[SEED] {${importId}} seeding stop_time_overrides`);
		const readStream = fs.createReadStream(`${__dirname}/../../tmp/${temporaryIdentifier}/stop_time_overrides.txt`, 'utf-8');

		const parser = parse({
			columns: true,
			relax_column_count: true,
		});
		
		await this.stopTimeRepository.delete({
			importId,
		});

		const batch = new BatchStream({ size: 500 });
		readStream
			.pipe(parser)
			.pipe(batch)
			.on('data', (records) => {
				kafka.sendBatch({
					messages: records,
					topic: KafkaTopics.STATIC_IMPORT_STOP_TIME_OVERRIDE,
					key: 'seed',
					headers: {
						action: 'seed',
						type: 'event',
						origin: process.env.KAFKA_ORIGIN,
						timestamp: (new Date()).toISOString(),
						topic: KafkaTopics.STATIC_IMPORT_STOP_TIME_OVERRIDE,
						importId
					},
				});
		  });

		return new Promise((resolve) => {
			readStream.on('end', () => resolve())
		})
	}
}
