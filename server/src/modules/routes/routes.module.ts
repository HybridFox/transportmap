import { Module } from '@nestjs/common';
import { CoreModule } from 'core/core.module';
import { columnProviders } from '../../../core/providers/table.providers';
import { RouteController } from './controllers/route.controller';
import { RouteService } from './services/route.service';

@Module({
	imports: [CoreModule],
	controllers: [RouteController],
	providers: [RouteService, ...columnProviders],
})
export class RoutesModule {}
