import { Module } from '@nestjs/common';
import { CoreModule } from 'core/core.module';
import { columnProviders } from '../../../core/providers/table.providers';
import { StaticSeederService } from './services/static-seeder.service';
import { Seeders } from './seeders';
import { RealtimeProcessorService } from './services/realtime-processor.service';

@Module({
	imports: [CoreModule],
	controllers: [],
	providers: [StaticSeederService, RealtimeProcessorService, ...Seeders, ...columnProviders],
})
export class GTFSModule {}
