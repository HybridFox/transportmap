import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Trip, TABLE_PROVIDERS } from '@transportmap/database';
import { KafkaTopics } from '@transportmap/kafka-connector';

import { kafka } from '../instances/kafka.instance';

@Injectable()
export class TripSeederService {
	constructor(@Inject(TABLE_PROVIDERS.TRIP_REPOSITORY) private tripRepository: Repository<Trip>) {
		this.subscribe();
	}

	public async subscribe() {
		kafka.subscribeBatch({
			topic: KafkaTopics.STATIC_IMPORT_TRIP,
			groupId: process.env.KAFKA_CONSUMER_GID + '.trip',
			callback: async (messages) => {
				try {
					console.log('TRIP', messages.length);
					await this.tripRepository.insert(
						messages.map(({ value: record, headers }) => ({
							id: record.trip_id,
							routeId: record.route_id,
							serviceId: record.service_id,
							headsign: record.trip_headsign,
							name: record.trip_short_name,
							directionId: record.direction_id,
							blockId: record.block_id,
							shapeId: record.shape_id,
							type: record.trip_type,
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
