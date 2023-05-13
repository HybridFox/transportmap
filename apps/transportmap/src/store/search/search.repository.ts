import { updateRequestStatus } from '@ngneat/elf-requests';
import { setProp } from '@ngneat/elf';

import { SearchService, searchService } from '../../services/search.service';

import { searchStore } from './search.store';
import { searchSelector } from './search.selectors';

export class SearchRepository {
	public searchResults$ = searchSelector.searchResults$;

	constructor(private readonly searchService: SearchService) {}

	public async searchTrips(search: Record<string, string>): Promise<any> {
		searchStore.update(updateRequestStatus('search', 'pending'));
		return this.searchService
			.search(search)
			.then((results) => {
					searchStore.update(
						setProp('results', results),
						updateRequestStatus('search', 'success')
					);

					return results;
				}
			)
	}

	public clear(): void {
		searchStore.update(
			setProp('results', undefined),
		);
	}
}

export const searchRepository = new SearchRepository(searchService)
