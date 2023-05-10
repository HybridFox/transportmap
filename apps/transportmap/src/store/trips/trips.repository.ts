import { updateRequestStatus } from '@ngneat/elf-requests';
import { resetActiveId, setActiveId, setEntities, upsertEntities } from '@ngneat/elf-entities';
import { setProps } from '@ngneat/elf';

import { TripsService, tripsService } from '../../services/vehicle.service';

import { tripsStore } from './trips.store';
import { tripsSelector } from './trips.selectors';
import { Trip } from './trips.types';

export class TripRepository {
	public trips$ = tripsSelector.trips$;
	public trip$ = tripsSelector.trip$;

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

	public async highlightTrip(tripId: string): Promise<Trip> {
		tripsStore.update(updateRequestStatus('get-trip', 'pending'));
		return this.tripsService
			.getOne(tripId)
			.then((trip) => {
					tripsStore.update(
						setProps({
							highlightedTrip: trip,
						}),
						updateRequestStatus('get-trip', 'success'),
					);

					return trip;
				}
			)
	}

	public async clearActive(): Promise<void> {
		tripsStore.update(
			resetActiveId()
		);
	}

	public async clearHighlight(): Promise<void> {
		tripsStore.update(
			setProps({ highlightedTrip: undefined })
		);
	}
}

export const tripsRepository = new TripRepository(tripsService)
