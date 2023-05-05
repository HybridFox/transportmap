import { Module } from '@nestjs/common';

import { CoreModule } from '~core/core.module';

import { columnProviders } from '../../core/providers/table.providers';

import { StopsController } from './controllers/stops.controller';
import { StopsService } from './services/stops.service';

@Module({
	imports: [CoreModule],
	controllers: [StopsController],
	providers: [StopsService, ...columnProviders],
})
export class StopsModule {}
