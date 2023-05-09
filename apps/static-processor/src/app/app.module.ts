import { Module } from '@nestjs/common';
import { columnProviders, databaseProviders } from '@transportmap/database';

import { Seeders } from './seeders';

@Module({
	imports: [],
	controllers: [],
	providers: [...Seeders, ...databaseProviders, ...columnProviders],
})
export class AppModule {}
