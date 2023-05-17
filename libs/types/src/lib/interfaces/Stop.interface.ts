export interface IStop {
	id: string;
	code: string;
	name: string;
	description: string;
	latitude: number;
	longitude: number;
	translations: Record<string, string>;
}
