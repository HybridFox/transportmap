import { Stop } from "@transportmap/database";

import { CalculatedTrip } from "./calculated-trip";

export interface SearchResults {
	trips: CalculatedTrip[];
	stops: (Stop & { translations: Record<string, string> })[]
}
