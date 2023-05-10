import { selectActiveEntity, selectAllEntities } from '@ngneat/elf-entities';
import { selectRequestStatus } from '@ngneat/elf-requests';
import { select } from '@ngneat/elf';

import { tripsStore } from './trips.store';

export const tripsSelector = {
	trips$: tripsStore.pipe(selectAllEntities()),
	trip$: tripsStore.pipe(selectActiveEntity()),
	tripLoading$: tripsStore.pipe(selectRequestStatus('get-trip')),
	highlightedTrip$: tripsStore.pipe(select((state) => state.highlightedTrip)),
};
