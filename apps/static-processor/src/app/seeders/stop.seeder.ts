import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Stop, TABLE_PROVIDERS } from '@transportmap/database';
import { KafkaTopics } from '@transportmap/kafka-connector';

import { kafka } from '../instances/kafka.instance';

@Injectable()
export class StopSeederService {
	constructor(@Inject(TABLE_PROVIDERS.STOP_REPOSITORY) private stopRepository: Repository<Stop>) {
		this.subscribe();
	}

	public async subscribe() {
		kafka.subscribeBatch({
			topic: KafkaTopics.STATIC_IMPORT_STOP,
			groupId: process.env.KAFKA_CONSUMER_GID + '.stop',
			callback: async (messages) => {
				try {
					console.log('STOP', messages.length);
					await this.stopRepository.insert(
						messages.map(({ value: record, headers }) => ({
							id: record.stop_id,
							code: record.stop_code,
							name: record.stop_name,
							description: record.stop_desc,
							latitude: record.stop_lat,
							longitude: record.stop_lon,
							zoneId: record.zone_id,
							url: record.stop_url,
							locationType: record.location_type,
							parent_station: record.parentStationId,
							platformCode: record.platform_code,
							importId: headers.importId,
						})),
					);
				} catch (e) {
					console.error(e)
				}
			}
		})
	}
}
