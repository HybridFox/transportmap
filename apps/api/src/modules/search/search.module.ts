import { Module } from '@nestjs/common';
import { columnProviders } from '@transportmap/database';

import { CoreModule } from '~core/core.module';

import { SearchController } from './controllers/search.controller';
import { SearchService } from './services/search.service';

@Module({
	imports: [CoreModule],
	controllers: [SearchController],
	providers: [SearchService, ...columnProviders],
})
export class SearchModule {}
