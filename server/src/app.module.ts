import { Module } from '@nestjs/common';
import { CoreModule } from 'core/core.module';
import { CommandModule } from 'nestjs-command';
import { GTFSModule } from './modules/gtfs/gtfs.module';
import { RoutesModule } from './modules/routes/routes.module';
import { StopsModule } from './modules/stops/stops.module';

@Module({
	imports: [CommandModule, GTFSModule, CoreModule, RoutesModule, StopsModule],
	controllers: [],
	providers: [],
})
export class AppModule {}
