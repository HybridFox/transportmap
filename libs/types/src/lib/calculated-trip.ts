import { Route } from "@transportmap/database";

export interface TripSection {
	type: string;
	startTime: string;
	endTime: string;
	realtimeStartTime: string | null;
	realtimeEndTime: string | null;
	startLocation: { longitude: number; latitude: number };
	endLocation: { longitude: number; latitude: number };
	distance: number;
	activeGeometry: number[][];
	bearing: number;
	speed: number;
	index: number;
}

export interface CalculatedTrip {
	id: string;
	headsign: string;
	name: string;
	sectionLocation: {
		longitude: number,
		latitude: number,
	},
	sectionProgress: number,
	bearing: number,
	speed: number,
	stopTimes: any[];
	sections: TripSection[],
	route: Route;
	osrmRoute: string[];
}
