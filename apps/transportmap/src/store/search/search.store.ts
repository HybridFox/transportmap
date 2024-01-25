import { createStore, withProps } from '@ngneat/elf';
import { withRequestsStatus } from '@ngneat/elf-requests';

export const searchStore = createStore(
	{ name: 'search' },
	withProps<{
		results?: any;
	}>({}),
	withRequestsStatus<string>()
);
