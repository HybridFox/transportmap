import { createStore, withProps } from '@ngneat/elf';
import { withActiveId, withEntities } from '@ngneat/elf-entities';
import { withRequestsStatus } from '@ngneat/elf-requests';
import { ICalculatedTrip } from '@transportmap/types';

export const tripsStore = createStore(
	{ name: 'trips' },
	withEntities<ICalculatedTrip>(),
	withActiveId(),
	withRequestsStatus<string>(),
	withProps<{
		highlightedTrip?: ICalculatedTrip;
	}>({})
);
