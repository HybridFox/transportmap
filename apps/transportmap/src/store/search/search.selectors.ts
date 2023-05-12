import { select } from '@ngneat/elf';

import { searchStore } from './search.store';

export const searchSelector = {
	searchResults$: searchStore.pipe(select((state) => state.results)),
};
