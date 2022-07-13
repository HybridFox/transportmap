interface GeoShape {
	coordinates: number[][];
	type: string;
}

interface StationToStationFields {
	geo_shape: GeoShape;
	geo_point_2d: number[];
	stationfrom_name: string;
	length: number;
	stationto_id: string;
	stationfrom_id: string;
	stationto_name: string;
}

interface Geometry {
	type: string;
	coordinates: number[];
}

export interface StationToStation {
	datasetid: string;
	recordid: string;
	fields: StationToStationFields;
	geometry: Geometry;
	record_timestamp: Date;
}
