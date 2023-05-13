import { createStore, withProps } from '@ngneat/elf';
import { withRequestsStatus } from '@ngneat/elf-requests';
import { SearchResults } from '@transportmap/types';

export const searchStore = createStore(
	{ name: 'search' },
	withProps<{
		results?: SearchResults;
	}>({}),
	withRequestsStatus<string>()
);
