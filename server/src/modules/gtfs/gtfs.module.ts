import { Module } from '@nestjs/common';
import { CoreModule } from 'core/core.module';
import { columnProviders } from '../../../core/providers/table.providers';
import { SeedService } from './services/seed.service';

@Module({
	imports: [CoreModule],
	controllers: [],
	providers: [SeedService, ...columnProviders],
})
export class GTFSModule {}
