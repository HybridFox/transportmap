import { Module } from '@nestjs/common';
import { CoreModule } from 'core/core.module';
import { columnProviders } from '../../../core/providers/table.providers';
import { SeedService } from './services/seed.service';
import { StopTimeSeederService } from './seeders/stop-time.seeder';

@Module({
	imports: [CoreModule],
	controllers: [],
	providers: [SeedService, StopTimeSeederService, ...columnProviders],
})
export class GTFSModule {}
