import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { StopTime, TABLE_PROVIDERS } from '@transportmap/database';
import { KafkaTopics } from '@transportmap/kafka-connector';

import { kafka } from '../instances/kafka.instance';

@Injectable()
export class StopTimeOverrideSeederService {
	constructor(@Inject(TABLE_PROVIDERS.STOP_TIME_REPOSITORY) private stopTimeRepository: Repository<StopTime>) {
		this.subscribe();
	}

	public async subscribe() {
		kafka.subscribe({
			topic: KafkaTopics.STATIC_IMPORT_STOP_TIME_OVERRIDE,
			groupId: process.env.KAFKA_CONSUMER_GID + '.stop-time-override',
			callback: async ({ value: record, headers }) => {
				console.log('OVERRIDE')
				await this.stopTimeRepository.update(
					{
						tripId: record.trip_id,
						stopSequence: record.stop_sequence,
						importId: headers.importId,
					},
					{
						stopIdOverride: record.stop_id,
					},
				);
			}
		})
	}
}
