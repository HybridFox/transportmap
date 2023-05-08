import { NestFactory } from '@nestjs/core';
import * as Sentry from '@sentry/node';

import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.use(Sentry.Handlers.requestHandler());
	// TracingHandler creates a trace for every incoming request
	app.use(Sentry.Handlers.tracingHandler());

	// the rest of your app

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
