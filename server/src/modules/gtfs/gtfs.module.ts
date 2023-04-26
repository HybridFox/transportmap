import { Module } from '@nestjs/common';
import { CoreModule } from 'core/core.module';
import { columnProviders } from '../../../core/providers/table.providers';
import { SeedService } from './services/seed.service';
import { Seeders } from './seeders';

@Module({
	imports: [CoreModule],
	controllers: [],
	providers: [SeedService, ...Seeders, ...columnProviders],
})
export class GTFSModule {}
