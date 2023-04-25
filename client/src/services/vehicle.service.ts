import ky from "ky";
import { Trip } from "../store/vehicles/trips.types";

export class TripsService {
    public async getAll(): Promise<Trip[]> {
        return ky.get('/api/v1/trips').json()
    }


    public async getOne(tripId: string): Promise<Trip> {
        return ky.get(`/api/v1/trips/${tripId}`).json()
    }
}

export const tripsService = new TripsService()