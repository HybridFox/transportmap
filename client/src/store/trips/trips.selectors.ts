import { selectActiveEntity, selectAllEntities } from '@ngneat/elf-entities';

import { tripsStore } from './trips.store';

export const tripsSelector = {
	trips$: tripsStore.pipe(selectAllEntities()),
	activeTrip$: tripsStore.pipe(selectActiveEntity()),
};
