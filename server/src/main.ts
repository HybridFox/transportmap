import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as Sentry from '@sentry/node';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	Sentry.init({ dsn: 'https://ac6c52be3ace4786b56f808e949d7b36@sentry.ibs.sh/2' });

	app.setGlobalPrefix('/api');
	await app.listen(3001);
}
bootstrap();
