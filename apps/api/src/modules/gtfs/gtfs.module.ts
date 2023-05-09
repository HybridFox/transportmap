import { Module } from '@nestjs/common';
import { columnProviders } from '@transportmap/database';

import { CoreModule } from '../../core/core.module';

import { StaticStaticProducerService } from './services/static-producer.service';
import { StaticProducers } from './static-producers';
import { RealtimeProcessorService } from './services/realtime-processor.service';
import { GtfsController } from './controllers/gtfs.controller';

@Module({
	imports: [CoreModule],
	controllers: [GtfsController],
	providers: [StaticStaticProducerService, RealtimeProcessorService, ...StaticProducers, ...columnProviders],
})
export class GTFSModule {}
