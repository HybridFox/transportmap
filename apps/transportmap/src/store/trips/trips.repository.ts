import { updateRequestStatus } from '@ngneat/elf-requests';
import { take, tap } from 'rxjs/operators';
import { resetActiveId, setActiveId, setEntities, upsertEntities } from '@ngneat/elf-entities';
import { Observable, map } from 'rxjs';

import { TripsService, tripsService } from '../../services/vehicle.service';

import { tripsStore } from './trips.store';
import { tripsSelector } from './trips.selectors';
import { Trip } from './trips.types';

export class TripRepository {
	public trips$ = tripsSelector.trips$;
	public activeTrip$ = tripsSelector.activeTrip$;

	constructor(private readonly tripsService: TripsService) {}

	public async getTrips(search: Record<string, string | number>): Promise<Trip[]> {
		tripsStore.update(updateRequestStatus('get-trips', 'pending'));
		return this.tripsService
			.get(search)
			.then((trips) => {
					tripsStore.update(
						setEntities(trips),
						updateRequestStatus('get-trips', 'success')
					);

					return trips;
				}
			)
	}

	public async searchTrips(search: Record<string, string>): Promise<Trip[]> {
		tripsStore.update(updateRequestStatus('search-trips', 'pending'));
		return this.tripsService
			.get(search)
			.then((trips) => {
					tripsStore.update(
						setEntities(trips),
						updateRequestStatus('search-trips', 'success')
					);

					return trips;
				}
			)
	}

	public async getTrip(tripId: string): Promise<Trip> {
		tripsStore.update(updateRequestStatus('get-trip', 'pending'));
		return this.tripsService
			.getOne(tripId)
			.then((trip) => {
					tripsStore.update(
						setActiveId(tripId),
						upsertEntities(trip),
						updateRequestStatus('get-trip', 'success'),
					);

					return trip;
				}
			)
	}

	public async clearActive(): Promise<void> {
		// tripsStore.update(updateRequestStatus('get-trips', 'pending'));
		// return this.tripsService
		// 	.getAll()
		// 	.then((trips) => {
					tripsStore.update(
						resetActiveId()
					);

			// 		return trips;
			// 	}
			// )
	}
}

export const tripsRepository = new TripRepository(tripsService)
