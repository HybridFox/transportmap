import { createStore, withProps } from '@ngneat/elf';
import { withActiveId, withEntities } from '@ngneat/elf-entities';
import { withRequestsStatus } from '@ngneat/elf-requests';
import { IStop } from '@transportmap/types';

export const stopsStore = createStore(
	{ name: 'stops' },
	withEntities<IStop>(),
	withActiveId(),
	withRequestsStatus<string>(),
	withProps<{
		highlightedStop?: IStop;
	}>({})
);
