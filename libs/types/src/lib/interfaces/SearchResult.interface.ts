import { ICalculatedTrip } from "./CalculatedTrip.interface";

export interface ISearchResult {
	trips: ICalculatedTrip[];
	stops: any[]
}
