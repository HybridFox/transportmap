import { NestFactory } from '@nestjs/core';
import * as Sentry from '@sentry/node';

import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	Sentry.init({
		dsn: process.env.SENTRY_DSN,
		tracesSampleRate: 1.0
	});

	const globalPrefix = 'api';
	app.setGlobalPrefix(globalPrefix);
	const port = process.env.PORT || 3000;
	await app.listen(port);

	console.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}

bootstrap();
