import * as hafas from 'hafas-client';

// TODO: composition typing
export type VehicleModel = hafas.Movement & {
	_id: string;
	extraData: any;
	trip?: hafas.Trip;
	composition: {
		materialUnits: any[];
	}[];
	projectedLocation: {
		latitude: number;
		longitude: number;
	};
	lineGeo: any;
};

export enum VEHICLE_FILTER {
	SHOW_COMPLETED = 'SHOW_COMPLETED',
	SHOW_ACTIVE = 'SHOW_ACTIVE',
	SHOW_ALL = 'all',
}
