import { ApiProperty } from "@nestjs/swagger";
import { ITripRoute } from "@transportmap/types";

export class OATripRoute implements ITripRoute {
	@ApiProperty()
	id: string;

	@ApiProperty()
	routeCode: string;

	@ApiProperty()
	name: string;
}
