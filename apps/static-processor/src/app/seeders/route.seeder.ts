import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Route, TABLE_PROVIDERS } from '@transportmap/database';
import { KafkaTopics } from '@transportmap/kafka-connector';

import { kafka } from '../instances/kafka.instance';

@Injectable()
export class RouteSeederService {
	constructor(@Inject(TABLE_PROVIDERS.ROUTE_REPOSITORY) private routeRepository: Repository<Route>) {
		this.subscribe();
	}

	public async subscribe() {
		kafka.subscribeBatch({
			topic: KafkaTopics.STATIC_IMPORT_ROUTE,
			groupId: process.env.KAFKA_CONSUMER_GID + '.route',
			callback: async (messages) => {
				try {
					console.log('ROUTE', messages.length);
					await this.routeRepository.insert(
						messages.map(({ value: record, headers }) => ({
							id: record.route_id,
							agencyId: record.agency_id,
							routeCode: record.route_short_name,
							name: record.route_long_name,
							description: record.route_desc,
							type: record.route_type,
							url: record.route_url,
							color: record.route_color,
							textColor: record.route_text_color,
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
