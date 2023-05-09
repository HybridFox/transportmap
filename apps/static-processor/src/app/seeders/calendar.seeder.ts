import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Calendar, TABLE_PROVIDERS } from '@transportmap/database';
import { KafkaTopics } from '@transportmap/kafka-connector';

import { kafka } from '../instances/kafka.instance';

@Injectable()
export class CalendarSeederService {
	constructor(@Inject(TABLE_PROVIDERS.CALENDAR_REPOSITORY) private calendarRepository: Repository<Calendar>) {
		this.subscribe();
	}

	public async subscribe() {
		kafka.subscribeBatch({
			topic: KafkaTopics.STATIC_IMPORT_CALENDAR,
			groupId: process.env.KAFKA_CONSUMER_GID + '.calendar',
			callback: async (messages) => {
				try {
					console.log('CALENDAR', messages.length);
					await this.calendarRepository.insert(
						messages.map(({ value: record, headers }) => ({
							serviceId: record.service_id,
							monday: record.monday,
							tuesday: record.tuesday,
							wednesday: record.wednesday,
							thursday: record.thursday,
							friday: record.friday,
							saturday: record.saturday,
							sunday: record.sunday,
							startDate: record.start_date,
							endDate: record.end_date,
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
