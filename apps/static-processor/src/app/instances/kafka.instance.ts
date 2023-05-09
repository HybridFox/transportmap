import { KafkaConnector } from '@transportmap/kafka-connector'

export const kafka = new KafkaConnector({
	kafkaHost: process.env.KAFKA_HOST,
	origin: process.env.KAFKA_ORIGIN
});
