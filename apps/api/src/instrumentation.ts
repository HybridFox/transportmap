import opentelemetry from "@opentelemetry/api";
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { BasicTracerProvider, SimpleSpanProcessor, ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';
import { MongoDBInstrumentation } from '@opentelemetry/instrumentation-mongodb';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { IORedisInstrumentation } from '@opentelemetry/instrumentation-ioredis';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { PeriodicExportingMetricReader, MeterProvider } from '@opentelemetry/sdk-metrics';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { registerInstrumentations } from '@opentelemetry/instrumentation';

const resource = Resource.default().merge(
	new Resource({
		[SemanticResourceAttributes.SERVICE_NAME]: 'transportmap-api',
		[SemanticResourceAttributes.SERVICE_VERSION]: '0.0.0',
	}),
);

registerInstrumentations({
	instrumentations: [
		new MongoDBInstrumentation(),
		new PgInstrumentation(),
		new ExpressInstrumentation(),
		new IORedisInstrumentation(),
		new NestInstrumentation(),
	],
});

const traceProvider = new BasicTracerProvider({
	resource,
});

const meterProvider = new MeterProvider({
	resource,
})

traceProvider.addSpanProcessor(
	new SimpleSpanProcessor(
		new OTLPTraceExporter({
			url: process.env.OTLP_TRACE_URL,
			headers: {},
		}),
	),
);
traceProvider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
traceProvider.register();

const metricReader = new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
		url: process.env.OTLP_METRIC_URL,
		headers: {},
	}),
});

meterProvider.addMetricReader(metricReader);

opentelemetry.metrics.setGlobalMeterProvider(meterProvider)
