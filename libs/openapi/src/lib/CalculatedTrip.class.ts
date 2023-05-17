import { ApiProperty } from "@nestjs/swagger";
import { ICalculatedTrip } from "@transportmap/types";

import { OATripSection } from "./TripSection.class";
import { OATripRoute } from "./TripRoute.class";
import { OALocation } from "./Location.class";

export class OACalculatedTrip implements ICalculatedTrip {
	@ApiProperty()
	id: string;

	@ApiProperty()
	name: string;

	@ApiProperty({ type: OALocation })
	sectionLocation: OALocation;

	@ApiProperty()
	bearing: number;

	@ApiProperty({ isArray: true, type: OATripSection })
	sections: OATripSection[];

	@ApiProperty({ type: OATripRoute })
	route: OATripRoute;

	@ApiProperty()
	sectionProgress: number;

	@ApiProperty()
	speed: number;
}
