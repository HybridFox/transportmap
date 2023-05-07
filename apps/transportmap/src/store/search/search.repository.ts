import { updateRequestStatus } from '@ngneat/elf-requests';
import { take, tap } from 'rxjs/operators';
import { deleteAllEntities, resetActiveId, setActiveId, setEntities, upsertEntities } from '@ngneat/elf-entities';
import { Observable, map } from 'rxjs';

import { searchStore } from './search.store';
import { searchSelector } from './search.selectors';
import { Trip } from '../trips/trips.types';
import { TripsService, tripsService } from '../../services/vehicle.service';

export class SearchRepository {
	public searchResults$ = searchSelector.searchResults$;

	constructor(private readonly tripsService: TripsService) {}

	public async searchTrips(search: Record<string, string>): Promise<Trip[]> {
		searchStore.update(updateRequestStatus('search-trips', 'pending'));
		return this.tripsService
			.get(search)
			.then((trips) => {
					searchStore.update(
						setEntities(trips),
						updateRequestStatus('search-trips', 'success')
					);

					return trips;
				}
			)
	}

	public clear(): void {
		searchStore.update(
			deleteAllEntities(),
		);
	}
}

export const searchRepository = new SearchRepository(tripsService)