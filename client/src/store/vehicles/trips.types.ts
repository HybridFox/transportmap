export interface Location {
	latitude: number;
	longitude: number;
}

export interface Route {
	id: string;
	agencyId: string;
	routeCode: string;
	name: string;
	description: string;
	type: string;
}

export interface Stop {
	id: string;
	code: string;
	name: string;
	description: string;
	latitude: number;
	longitude: number;
	projectedLatitude: number;
	projectedLongitude: number;
}

export interface StopTime {
	id: string;
	tripId: string;
	arrivalTime: string;
	departureTime: string;
	stopId: string;
	stopSequence: number;
	stopHeadsign: string;
	pickupType: string;
	dropOffType: string;
	stop: Stop;
}

interface OSRMStep {
	distance: number;
	geometry: {
		coordinates: number[][]
	}
}

export interface OSRMLeg {
	distance: number;
	duration: number;
	steps: OSRMStep[];
}

// TODO: find out what is actually still needed
export interface Trip {
	id: string;
	sectionLocation: Location;
	route: Route;
	stopTimes: StopTime[];
	name: string;
	headsign: string;
	extraData?: Record<string, string>;
	sectionCoordinates: number[][];
	sectionProgress: number;
	bearing: number;
	speed: number;
	osrmRoute: OSRMLeg[];
	sections: Section[];
	composition: any;
}

export interface Section {
	type: string;
	startTime: string;
	endTime: string;
	startLocation: { longitude: number; latitude: number };
	endLocation: { longitude: number; latitude: number };
	distance: number;
	activeGeometry: number[][];
	bearing: number;
	speed: number;
	index: number;
}