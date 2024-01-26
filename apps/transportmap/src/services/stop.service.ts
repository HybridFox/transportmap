import ky from "ky";
import {IStop} from "@transportmap/types";

export class StopsService {
    public async get(searchParams: Record<string, string | number>): Promise<IStop[]> {
        return ky.get('/api/v1/stops', {
            searchParams
        }).json()
    }

    public async getOne(tripId: string): Promise<IStop> {
        return ky.get(`/api/v1/stops/${tripId}`).json()
    }
}

export const stopsService = new StopsService()
