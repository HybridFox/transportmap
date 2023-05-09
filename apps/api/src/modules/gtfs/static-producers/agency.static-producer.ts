/* eslint-disable @nx/enforce-module-boundaries */
import * as fs from 'fs';

import { Injectable } from '@nestjs/common';
import { parse } from 'csv-parse';
import BatchStream from 'batch-stream';
import { KafkaTopics } from '@transportmap/kafka-connector';

import { kafka } from '~core/instances/kafka.instance';

@Injectable()
export class AgencyStaticProducerService {
	public async seed(temporaryIdentifier: string): Promise<void> {
		if (!fs.existsSync(`${__dirname}/../../tmp/${temporaryIdentifier}/agency.txt`)) {
			return;
		}

		const readStream = fs.createReadStream(`${__dirname}/../../tmp/${temporaryIdentifier}/agency.txt`, 'utf-8');

		const parser = parse({
			columns: true,
			relax_column_count: true,
		});

		const batch = new BatchStream({ size: 500 });
		readStream
			.pipe(parser)
			.pipe(batch)
			.on('data', (records) => {
				kafka.sendBatch({
					messages: records,
					topic: KafkaTopics.STATIC_IMPORT_AGENCY,
					key: 'seed',
					headers: {
						action: 'seed',
						type: 'event',
						origin: process.env.KAFKA_ORIGIN,
						timestamp: (new Date()).toISOString(),
						topic: KafkaTopics.STATIC_IMPORT_AGENCY
					},
				});
		  });

		return new Promise((resolve) => {
			readStream.on('end', () => resolve())
		})
	}
}
