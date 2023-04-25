import { updateRequestStatus } from '@ngneat/elf-requests';
import { take, tap } from 'rxjs/operators';
import { deleteEntities, removeActiveIds, resetActiveId, setActiveId, setEntities, updateEntities, upsertEntities } from '@ngneat/elf-entities';
import { Observable, map } from 'rxjs';

import { tripsStore } from './trips.store';
import { tripsSelector } from './trips.selectors';
import { Trip } from './trips.types';
import { TripsService, tripsService } from '../../services/vehicle.service';

export class TripRepository {
	public trips$ = tripsSelector.trips$;
	public activeTrip$ = tripsSelector.activeTrip$;

	constructor(private readonly tripsService: TripsService) {}

	public async getTrips(): Promise<Trip[]> {
		tripsStore.update(updateRequestStatus('get-trips', 'pending'));
		return this.tripsService
			.getAll()
			.then((trips) => {
					tripsStore.update(
						upsertEntities(trips),
						updateRequestStatus('get-trips', 'success')
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