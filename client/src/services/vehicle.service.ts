import ky from "ky";
import { Trip } from "../store/trips/trips.types";

export class TripsService {
    public async get(searchParams: Record<string, string>): Promise<Trip[]> {
        return ky.get('/api/v1/trips', {
            searchParams
        }).json()
    }


    public async getOne(tripId: string): Promise<Trip> {
        return ky.get(`/api/v1/trips/${tripId}`).json()
    }
}

export const tripsService = new TripsService()