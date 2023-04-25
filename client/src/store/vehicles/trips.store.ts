import { createStore, withProps } from '@ngneat/elf';
import { withActiveId, withEntities } from '@ngneat/elf-entities';
import { withRequestsStatus } from '@ngneat/elf-requests';

import { Trip } from './trips.types';

export const tripsStore = createStore(
	{ name: 'trips' },
	withEntities<Trip>(),
	withActiveId(),
	withRequestsStatus<string>()
);
