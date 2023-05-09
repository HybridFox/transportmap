import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Agency, TABLE_PROVIDERS } from '@transportmap/database';
import { KafkaTopics } from '@transportmap/kafka-connector';

import { kafka } from '../instances/kafka.instance';

@Injectable()
export class AgencySeederService {
	constructor(@Inject(TABLE_PROVIDERS.AGENCY_REPOSITORY) private agencyRepository: Repository<Agency>) {
		this.subscribe();
	}

	public async subscribe() {
		kafka.subscribe({
			topic: KafkaTopics.STATIC_IMPORT_AGENCY,
			groupId: process.env.KAFKA_CONSUMER_GID + '.agency',
			callback: async ({ value: record }) => {
				try {
					await this.agencyRepository.upsert({
						id: record.agency_id,
						name: record.agency_name,
						url: record.agency_url,
						timezone: record.agency_timezone,
						language: record.agency_lang,
						phoneNumber: record.agency_phone
					}, ['id']);
				} catch (e) {
					console.error(e)
				}
			}
		})
	}
}
