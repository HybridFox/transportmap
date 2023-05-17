import { ApiProperty } from "@nestjs/swagger";
import { IStop } from "@transportmap/types";

export class OAStop implements IStop {
	@ApiProperty()
	id: string;

	@ApiProperty()
	code: string;
	
	@ApiProperty()
	name: string;
	
	@ApiProperty()
	description: string;
	
	@ApiProperty()
	latitude: number;
	
	@ApiProperty()
	longitude: number;
	
	@ApiProperty()
	translations: Record<string, string>;
}
