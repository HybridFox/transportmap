import { select } from '@ngneat/elf';

import { uiStore } from './ui.store';

export const uiSelector = {
	userLocationEnabled$: uiStore.pipe(select((state) => state.userLocationEnabled)),
};
