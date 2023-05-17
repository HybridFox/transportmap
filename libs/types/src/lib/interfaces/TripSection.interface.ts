import { SectionType } from "../enum/section.enum";

import { ILocation } from "./Location.interface";
import { IStop } from "./Stop.interface";

export interface ITripSection {
	type: SectionType;
	startTime: string;
	realtimeStartTime: string;
	endTime: string;
	realtimeEndTime: string;
	startLocation: ILocation;
	endLocation: ILocation;
	distance: number;
	bearing: number;
	speed: number;
	polyline?: string;
	stop?: IStop;
}
