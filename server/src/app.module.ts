import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { CoreModule } from 'core/core.module';
import { CommandModule } from 'nestjs-command';
import { GTFSModule } from './modules/gtfs/gtfs.module';
import { RoutesModule } from './modules/routes/routes.module';
import { StopsModule } from './modules/stops/stops.module';
import { TripsModule } from './modules/trips/trips.module';
import * as path from 'path';
import { ScheduleModule } from '@nestjs/schedule';

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

		ScheduleModule.forRoot(),
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
