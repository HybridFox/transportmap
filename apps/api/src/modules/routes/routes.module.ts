import { Module } from '@nestjs/common';
import { columnProviders } from '@transportmap/database';

import { CoreModule } from '~core/core.module';

import { RouteController } from './controllers/route.controller';
import { RouteService } from './services/route.service';

@Module({
	imports: [CoreModule],
	controllers: [RouteController],
	providers: [RouteService, ...columnProviders],
})
export class RoutesModule {}
