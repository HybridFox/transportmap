import { ITripSection } from "./TripSection.interface";
import { ITripRoute } from "./TripRoute.interface";
import { ILocation } from "./Location.interface";

export interface ICalculatedTrip {
	id: string;
	name: string;
	sectionLocation: ILocation;
	bearing: number;
	sections: ITripSection[];
	route: ITripRoute;
	sectionProgress: number;
	speed: number;
}
