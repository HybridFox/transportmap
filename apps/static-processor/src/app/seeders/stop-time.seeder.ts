import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { StopTime, TABLE_PROVIDERS } from '@transportmap/database';
import { KafkaTopics } from '@transportmap/kafka-connector';

import { kafka } from '../instances/kafka.instance';

@Injectable()
export class StopTimeSeederService {
	constructor(@Inject(TABLE_PROVIDERS.STOP_TIME_REPOSITORY) private stopTimeRepository: Repository<StopTime>) {
		this.subscribe();
	}

	public async subscribe() {
		kafka.subscribeBatch({
			topic: KafkaTopics.STATIC_IMPORT_STOP_TIME,
			groupId: process.env.KAFKA_CONSUMER_GID + '.stop-time',
			callback: async (messages) => {
				try {
					console.log('STOP_TIME', messages.length);
					await this.stopTimeRepository.insert(
						messages.map(({ value: record, headers }) => ({
							id: `${record.trip_id}_${record.stop_sequence}`,
							tripId: record.trip_id,
							arrivalTime: record.arrival_time,
							departureTime: record.departure_time,
							stopId: record.stop_id,
							stopSequence: record.stop_sequence,
							stopHeadsign: record.stop_headsign,
							pickupType: record.pickup_type,
							dropOffType: record.drop_off_type,
							shapeDistTraveled: record.shape_dist_traveled,
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
