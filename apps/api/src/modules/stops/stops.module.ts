import { Module } from '@nestjs/common';
import { columnProviders } from '@transportmap/database';

import { CoreModule } from '~core/core.module';


import { StopsController } from './controllers/stops.controller';
import { StopsService } from './services/stops.service';

@Module({
	imports: [CoreModule],
	controllers: [StopsController],
	providers: [StopsService, ...columnProviders],
})
export class StopsModule {}
