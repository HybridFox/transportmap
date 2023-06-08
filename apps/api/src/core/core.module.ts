import { Module } from '@nestjs/common';
import { databaseProviders } from '@transportmap/database';

import { LoggingService } from './services/logging.service';

@Module({
	providers: [...databaseProviders, LoggingService],
	exports: [...databaseProviders, LoggingService],
})
export class CoreModule {}
