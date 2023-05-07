import { selectActiveEntity, selectAllEntities } from '@ngneat/elf-entities';

import { searchStore } from './search.store';

export const searchSelector = {
	searchResults$: searchStore.pipe(selectAllEntities()),
};
