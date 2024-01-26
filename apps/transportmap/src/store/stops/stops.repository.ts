import { updateRequestStatus } from '@ngneat/elf-requests';
import { resetActiveId, setActiveId, setEntities, upsertEntities } from '@ngneat/elf-entities';
import { setProps } from '@ngneat/elf';
import { IStop } from '@transportmap/types';

import { StopsService, stopsService } from '../../services/stop.service';

import { stopsStore } from './stops.store';
import { stopsSelector } from './stops.selectors';

export class StopRepository {
	public stops$ = stopsSelector.stops$;
	public stop$ = stopsSelector.stop$;

	constructor(private readonly stopsService: StopsService) {}

	public async getStops(search: Record<string, string | number>): Promise<IStop[]> {
		stopsStore.update(updateRequestStatus('get-stops', 'pending'));
		return this.stopsService
			.get(search)
			.then((stops) => {
					stopsStore.update(
						setEntities(stops),
						updateRequestStatus('get-stops', 'success')
					);

					return stops;
				}
			)
	}

	public async getStop(stopId: string): Promise<IStop> {
		stopsStore.update(updateRequestStatus('get-stop', 'pending'));
		return this.stopsService
			.getOne(stopId)
			.then((stop) => {
					stopsStore.update(
						setActiveId(stopId),
						upsertEntities(stop),
						updateRequestStatus('get-stop', 'success'),
					);

					return stop;
				}
			)
	}

	public async highlightStop(stopId: string): Promise<IStop> {
		stopsStore.update(updateRequestStatus('get-stop', 'pending'));
		return this.stopsService
			.getOne(stopId)
			.then((stop) => {
					stopsStore.update(
						setProps({
							highlightedStop: stop,
						}),
						updateRequestStatus('get-stop', 'success'),
					);

					return stop;
				}
			)
	}

	public async clearActive(): Promise<void> {
		stopsStore.update(
			resetActiveId()
		);
	}

	public async clearHighlight(): Promise<void> {
		stopsStore.update(
			setProps({ highlightedStop: undefined })
		);
	}
}

export const stopsRepository = new StopRepository(stopsService)
