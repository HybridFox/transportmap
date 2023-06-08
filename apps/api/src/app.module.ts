// import * as path from 'path';

import { Module } from '@nestjs/common';
import { CommandModule } from 'nestjs-command';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { CoreModule } from '~core/core.module';
// import { SentryInterceptor } from '~core/interceptors/sentry.interceptor';

import { GTFSModule } from './modules/gtfs/gtfs.module';
import { RoutesModule } from './modules/routes/routes.module';
import { StopsModule } from './modules/stops/stops.module';
import { TripsModule } from './modules/trips/trips.module';
import { SearchModule } from './modules/search/search.module';

@Module({
	imports: [
		CommandModule,
		GTFSModule,
		CoreModule,
		RoutesModule,
		StopsModule,
		TripsModule,
		SearchModule,
		// ServeStaticModule.forRoot({
		// 	rootPath: path.join(__dirname, '../..', 'src/modules/trips/static'),
		// 	serveRoot: '/static',
		// }),
		ScheduleModule.forRoot()
	],
	controllers: [],
	providers: [
		// {
		// 	provide: APP_INTERCEPTOR,
		// 	useClass: SentryInterceptor,
		// },
	],
})
export class AppModule {}
