import { createStore, withProps } from '@ngneat/elf';
import { withActiveId, withEntities } from '@ngneat/elf-entities';
import { withRequestsStatus } from '@ngneat/elf-requests';

import { Trip } from '../trips/trips.types';

export const searchStore = createStore(
	{ name: 'search' },
	withEntities<Trip>(),
	withRequestsStatus<string>()
);
