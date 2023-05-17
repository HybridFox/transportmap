import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as Sentry from '@sentry/node';

import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.useWebSocketAdapter(new WsAdapter(app));
	app.use(Sentry.Handlers.requestHandler());
	// TracingHandler creates a trace for every incoming request
	app.use(Sentry.Handlers.tracingHandler());

	const config = new DocumentBuilder()
		.setTitle('Waar is Mijn Trein API')
		.setDescription('This api documents the "Waar is Mijn Trein" API. This API is currently not meant to be used outside of the application itself, endpoints are subject to change')
		.setVersion('1.0')
		// .addTag('cats')
		.build();
	// the rest of your app

	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('docs', app, document);

	const globalPrefix = 'api';
	app.setGlobalPrefix(globalPrefix);
	const port = process.env.PORT || 3000;
	await app.listen(port);

	Sentry.init({
		dsn: process.env.SENTRY_DSN,
		tracesSampleRate: 1.0,
		integrations: [
			// enable HTTP calls tracing
			new Sentry.Integrations.Http({ tracing: true }),
			...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations(),
		],
	});

	console.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
	app.use(Sentry.Handlers.errorHandler());
}

bootstrap();
