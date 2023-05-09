import { Module } from '@nestjs/common';
import { columnProviders } from '@transportmap/database';

import { CoreModule } from '~core/core.module';


import { TripsController } from './controllers/trips.controller';
import { CompositionService } from './services/composition.service';
import { TripsService } from './services/trips.service';
import { TripsGateway } from './gateways/trips.gateway';

@Module({
	imports: [CoreModule],
	controllers: [TripsController],
	providers: [TripsService, CompositionService, ...columnProviders, TripsGateway],
})
export class TripsModule {}
