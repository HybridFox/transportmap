import { Module } from '@nestjs/common';

import { databaseProviders } from './providers/database.providers';
import { LoggingService } from './services/logging.service';
import { SentryInterceptor } from './interceptors/sentry.interceptor';

@Module({
	providers: [...databaseProviders, LoggingService, SentryInterceptor],
	exports: [...databaseProviders, LoggingService, SentryInterceptor],
})
export class CoreModule {}
