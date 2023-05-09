import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Translation, TABLE_PROVIDERS } from '@transportmap/database';
import { KafkaTopics } from '@transportmap/kafka-connector';

import { kafka } from '../instances/kafka.instance';

@Injectable()
export class TranslationSeederService {
	constructor(@Inject(TABLE_PROVIDERS.TRANSLATION_REPOSITORY) private translationRepository: Repository<Translation>) {
		this.subscribe();
	}

	public async subscribe() {
		kafka.subscribeBatch({
			topic: KafkaTopics.STATIC_IMPORT_TRANSLATION,
			groupId: process.env.KAFKA_CONSUMER_GID + '.translation',
			callback: async (messages) => {
				try {
					console.log('TRANSLATION', messages.length);
					await this.translationRepository.insert(
						messages.map(({ value: record, headers }) => ({
							translationKey: record.trans_id,
							language: record.lang,
							translation: record.translation,
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
