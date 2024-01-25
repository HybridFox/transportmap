import ky from "ky";
import {ICalculatedTrip} from "@transportmap/types";

export class TripsService {
    public async get(searchParams: Record<string, string | number>): Promise<ICalculatedTrip[]> {
        return ky.get('/api/v1/trips', {
            searchParams
        }).json()
    }

    public async getOne(tripId: string): Promise<ICalculatedTrip> {
        return ky.get(`/api/v1/trips/${tripId}`).json()
    }
}

export const tripsService = new TripsService()
