import { ApiProperty } from "@nestjs/swagger";
import { ILocation } from "@transportmap/types";

export class OALocation implements ILocation {
	@ApiProperty()
	longitude: number;

	@ApiProperty()
	latitude: number;
}
