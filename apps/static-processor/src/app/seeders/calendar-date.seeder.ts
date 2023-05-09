import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CalendarDate, TABLE_PROVIDERS } from '@transportmap/database';
import { KafkaTopics } from '@transportmap/kafka-connector';

import { kafka } from '../instances/kafka.instance';

@Injectable()
export class CalendarDateSeederService {
	constructor(@Inject(TABLE_PROVIDERS.CALENDAR_DATE_REPOSITORY) private calendarDateRepository: Repository<CalendarDate>) {
		this.subscribe();
	}

	public async subscribe() {
		kafka.subscribeBatch({
			topic: KafkaTopics.STATIC_IMPORT_CALENDAR_DATE,
			groupId: process.env.KAFKA_CONSUMER_GID + '.calendar-date',
			callback: async (messages) => {
				try {
					console.log('CALENDAR_DATE', messages.length);
					await this.calendarDateRepository.insert(
						messages.map(({ value: record, headers }) => ({
							serviceId: record.service_id,
							date: record.date,
							exceptionType: record.exception_type,
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
