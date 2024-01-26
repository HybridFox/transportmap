import { selectActiveEntity, selectAllEntities } from '@ngneat/elf-entities';
import { selectRequestStatus } from '@ngneat/elf-requests';
import { select } from '@ngneat/elf';

import { stopsStore } from './stops.store';

export const stopsSelector = {
	stops$: stopsStore.pipe(selectAllEntities()),
	stop$: stopsStore.pipe(selectActiveEntity()),
	stopLoading$: stopsStore.pipe(selectRequestStatus('get-stop')),
	highlightedStop$: stopsStore.pipe(select((state) => state.highlightedStop)),
};
