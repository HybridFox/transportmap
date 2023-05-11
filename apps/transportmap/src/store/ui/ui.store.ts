import { createStore, withProps } from '@ngneat/elf';

export interface UiState {
	userLocationEnabled: boolean;
}

export const uiStore = createStore(
	{ name: 'ui' },
	withProps<UiState>({
		userLocationEnabled: false
	})
);
