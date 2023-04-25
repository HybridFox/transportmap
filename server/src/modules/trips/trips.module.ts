import { Module } from '@nestjs/common';
import { CoreModule } from 'core/core.module';
import { columnProviders } from '../../../core/providers/table.providers';
import { TripsController } from './controllers/trips.controller';
import { CompositionService } from './services/composition.service';
import { GeoService } from './services/geo.service';
import { TripsService } from './services/trips.service';
import { TripsGateway } from './gateways/trips.gateway';

@Module({
	imports: [CoreModule],
	controllers: [TripsController],
	providers: [TripsService, CompositionService, GeoService, ...columnProviders, TripsGateway],
})
export class TripsModule {}
