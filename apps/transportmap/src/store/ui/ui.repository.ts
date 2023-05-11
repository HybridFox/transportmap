import { setProp } from '@ngneat/elf';

import { uiStore } from './ui.store';
import { uiSelector } from './ui.selectors';

export class UiRepository {
	public userLocationEnabled$ = uiSelector.userLocationEnabled$;

	public setUserLocationEnabled(enabled: boolean): void {
		uiStore.update(
			setProp('userLocationEnabled', enabled),
		);
	}
}

export const uiRepository = new UiRepository()
