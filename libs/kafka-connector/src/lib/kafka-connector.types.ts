export interface KafkaConstructor {
	kafkaHost: string;
	origin: string;
	ssl?: any;
	sasl?: any;
}

export interface KafkaSend {
	topic: string;
	body: any;
	headers?: Record<string, string>;
	key: string;
}

export interface KafkaSendBatch {
	topic: string;
	messages: any[];
	headers?: Record<string, string>;
	key: string;
}

export interface KafkaSubscribe {
	topic: string;
	groupId: string;
	callback: (message: any, topic: string) => void;
}

export interface KafkaSubscribeBatch {
	topic: string;
	groupId: string;
	callback: (messages: any[]) => Promise<void>;
}
