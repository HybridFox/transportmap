import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type VehicleDocument = Vehicle & Document;

class VehicleLocation extends Document {
	@Prop()
	type: string;

	@Prop()
	latitude: number;

	@Prop()
	longitude: number;
}

class VehicleLine extends Document {
	@Prop()
	type: string;

	@Prop()
	id: string;

	@Prop()
	fahrtNr: string;

	@Prop()
	name: string;

	@Prop()
	public: boolean;

	@Prop()
	productName: string;

	@Prop()
	mode: string;

	@Prop()
	product: string;
}

@Schema()
export class Vehicle extends Document {
	@Prop()
	direction: string;

	@Prop()
	tripId: string;

	@Prop()
	lineId: string;

	@Prop({ type: mongoose.Schema.Types.Mixed })
	lineGeo: any;

	@Prop({ type: VehicleLocation })
	location: VehicleLocation;

	@Prop({ type: VehicleLocation })
	projectedLocation: VehicleLocation;

	@Prop({ type: VehicleLine })
	line: VehicleLine;
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);
