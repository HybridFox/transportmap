import { ApiProperty } from "@nestjs/swagger";

export class OAHttpError {
	@ApiProperty()
	statusCode: number;

	@ApiProperty()
	message: string;

	@ApiProperty()
	error: string;
}
