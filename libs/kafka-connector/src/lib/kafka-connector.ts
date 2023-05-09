import { Kafka as KafkaJS, CompressionTypes, Consumer, Producer } from 'kafkajs';

import { KafkaConstructor, KafkaSend, KafkaSendBatch, KafkaSubscribe, KafkaSubscribeBatch } from './kafka-connector.types';

const messageConverter = (message: any) => {
	const result = { ...message };

	if (message.key) {
		result.key = message.key.toString('utf8');
	}

	if (message.value) {
		try {
			result.value = JSON.parse(message.value.toString('utf8'));
		} catch (e) {
			result.value = message.value.toString('utf8');
		}
	}

	if (typeof message.headers === 'object') {
		result.headers = Object.keys(message.headers).reduce((acc, key) => ({ ...acc, [key]: message.headers[key].toString('utf8') }), {});
	}

	return result;
};

export class KafkaConnector {
	public kafka: KafkaJS;

	private consumers: Consumer[];
	private origin: string;
	private producer: Producer;

	constructor({ kafkaHost, origin, ssl, sasl }: KafkaConstructor) {
		this.consumers = [];
		this.origin = origin;
		this.kafka = new KafkaJS({
			clientId: origin,
			brokers: kafkaHost.split(','),
			...(ssl && { ssl }),
			...(sasl && { sasl }),
		});

		this.producer = this.kafka.producer();
		this.producer.connect();
	}

	send({ topic, body, headers, key }: KafkaSend) {
		return (async () => {
			const message = JSON.stringify(body);

			await this.producer.send({
				topic,
				messages: [
					{
						key: key || 'body',
						value: message,
						headers: {
							timestamp: new Date().toString(),
							...headers,
						},
					},
				],
				compression: CompressionTypes.None,
			});
		})();
	}

	async sendBatch({ topic, messages, headers, key }: KafkaSendBatch) {
		await this.producer.send({
			topic,
			messages: messages.map((message: any) => ({
				key,
				value: JSON.stringify(message),
				headers,
			})),
			compression: CompressionTypes.None,
		});
	}

	subscribe({ topic, callback, groupId }: KafkaSubscribe) {
		const consumer = this.kafka.consumer({ groupId });
		this.consumers.push(consumer);

		return (async () => {
			await consumer.connect();
			await consumer.subscribe({ topic });
			await consumer.run({
				// fromBeginning: true,
				eachMessage: async ({ topic: t, message }) => callback(messageConverter(message), t),
			});
		})();
	}

	subscribeBatch({ topic, callback, groupId }: KafkaSubscribeBatch) {
		const consumer = this.kafka.consumer({ groupId });
		this.consumers.push(consumer);

		return (async () => {
			await consumer.connect();
			await consumer.subscribe({ topic });
			await consumer.run({
				// fromBeginning: true,
				eachBatch: async ({
					batch,
					resolveOffset
				}) => {
					await callback(batch.messages.map((message) => messageConverter(message)))
					resolveOffset(batch.messages[batch.messages.length - 1].offset)
				},
			});
		})();
	}

	disconnectAllConsumers() {
		return Promise.all(this.consumers.map((consumer) => consumer.disconnect()));
	}

	disconnectAll() {
		return Promise.all([this.disconnectAllConsumers(), this.producer.disconnect()]);
	}
}
