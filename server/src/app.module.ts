import * as path from 'path';

import { HttpException, Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { CommandModule } from 'nestjs-command';
import { ScheduleModule } from '@nestjs/schedule';
import { SentryModule, SentryInterceptor } from '@ntegral/nestjs-sentry';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { CoreModule } from '~core/core.module';

import { version } from '../package.json';

import { GTFSModule } from './modules/gtfs/gtfs.module';
import { RoutesModule } from './modules/routes/routes.module';
import { StopsModule } from './modules/stops/stops.module';
import { TripsModule } from './modules/trips/trips.module';

@Module({
	imports: [
		CommandModule,
		GTFSModule,
		CoreModule,
		RoutesModule,
		StopsModule,
		TripsModule,
		ServeStaticModule.forRoot({
			rootPath: path.join(__dirname, '../..', 'src/modules/trips/static'),
			serveRoot: '/static',
		}),
		SentryModule.forRoot({
			dsn: 'https://ac6c52be3ace4786b56f808e949d7b36@sentry.ibs.sh/2',
			debug: false,
			environment: process.env.NODE_ENV,
			release: version,
			logLevels: ['debug'],
		}),
		ScheduleModule.forRoot(),
	],
	controllers: [],
	providers: [
		{
			provide: APP_INTERCEPTOR,
			useFactory: () =>
				new SentryInterceptor({
					filters: [
						{
							type: HttpException,
							filter: (exception: HttpException) => 500 > exception.getStatus(), // Only report 500 errors
						},
					],
				}),
		},
	],
})
export class AppModule {}
