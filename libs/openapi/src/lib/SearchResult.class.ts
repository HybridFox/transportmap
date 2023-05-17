import { ApiProperty } from "@nestjs/swagger";
import { ISearchResult } from "@transportmap/types";

import { OACalculatedTrip } from "./CalculatedTrip.class";

export class OASearchResult implements ISearchResult {
	@ApiProperty({ isArray: true, type: OACalculatedTrip })
	trips: OACalculatedTrip[];
	
	@ApiProperty({ isArray: true })
	stops: any[]
}
