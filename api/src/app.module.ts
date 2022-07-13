import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommandModule } from 'nestjs-command';
import { ScheduleModule } from '@nestjs/schedule';

import { VehicleModule } from './modules/vehicle/vehicle.module';

@Module({
	imports: [CommandModule, MongooseModule.forRoot(process.env.MONGO_URI), VehicleModule, ScheduleModule.forRoot()],
	controllers: [],
	providers: [],
})
export class AppModule {}
