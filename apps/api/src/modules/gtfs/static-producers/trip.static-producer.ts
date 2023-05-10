/* eslint-disable @nx/enforce-module-boundaries */
import * as fs from 'fs';

import { Inject, Injectable } from '@nestjs/common';
import { parse } from 'csv-parse';
import { Repository } from 'typeorm';
import { Trip, TABLE_PROVIDERS } from '@transportmap/database';
import BatchStream from 'batch-stream';
import { KafkaTopics } from '@transportmap/kafka-connector';

import { kafka } from '~core/instances/kafka.instance';

@Injectable()
export class TripStaticProducerService {
	constructor(@Inject(TABLE_PROVIDERS.TRIP_REPOSITORY) private tripRepository: Repository<Trip>) {}

	public async seed(temporaryIdentifier: string, importId: string): Promise<void> {
		if (!fs.existsSync(`${__dirname}/../../tmp/${temporaryIdentifier}/trips.txt`)) {
			return;
		}
		
		console.log(`[SEED] {${importId}} seeding trips`);
		const readStream = fs.createReadStream(`${__dirname}/../../tmp/${temporaryIdentifier}/trips.txt`, 'utf-8');

		const parser = parse({
			columns: true,
			relax_column_count: true,
		});
		
		await this.tripRepository.delete({
			importId,
		});

		const batch = new BatchStream({ size: 500 });
		readStream
			.pipe(parser)
			.pipe(batch)
			.on('data', (records) => {
				kafka.sendBatch({
					messages: records,
					topic: KafkaTopics.STATIC_IMPORT_TRIP,
					key: 'seed',
					headers: {
						action: 'seed',
						type: 'event',
						origin: process.env.KAFKA_ORIGIN,
						timestamp: (new Date()).toISOString(),
						topic: KafkaTopics.STATIC_IMPORT_TRIP,
						importId
					},
				});
		  });

		return new Promise((resolve) => {
			readStream.on('end', () => resolve())
		})
	}
}
