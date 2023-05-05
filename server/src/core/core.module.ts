import { Module } from '@nestjs/common';

import { databaseProviders } from './providers/database.providers';
import { LoggingService } from './services/logging.service';

@Module({
	providers: [...databaseProviders, LoggingService],
	exports: [...databaseProviders, LoggingService],
})
export class CoreModule {}
