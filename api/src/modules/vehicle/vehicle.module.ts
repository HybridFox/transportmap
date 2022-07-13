import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { VehicleController } from './controllers/vehicle.controller';
import { VehicleService } from './services/vehicle.service';

import { Vehicle, VehicleSchema } from '~schemas/vehicle.schema';

@Module({
	imports: [MongooseModule.forFeature([{ name: Vehicle.name, schema: VehicleSchema }])],
	controllers: [VehicleController],
	providers: [VehicleService],
})
export class VehicleModule {}
