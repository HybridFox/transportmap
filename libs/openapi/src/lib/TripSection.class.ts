import { ApiProperty } from "@nestjs/swagger";
import { ITripSection, SectionType } from "@transportmap/types";

import { OALocation } from "./Location.class";

export class OATripSection implements ITripSection {
	@ApiProperty({ type: String })
	type: SectionType;

	@ApiProperty()
	startTime: string;

	@ApiProperty()
	realtimeStartTime: string;

	@ApiProperty()
	endTime: string;

	@ApiProperty()
	realtimeEndTime: string;

	@ApiProperty({ type: OALocation })
	startLocation: OALocation;

	@ApiProperty({ type: OALocation })
	endLocation: OALocation;

	@ApiProperty()
	distance: number;

	@ApiProperty()
	bearing: number;

	@ApiProperty()
	speed: number;

	@ApiProperty()
	polyline: string;
}
