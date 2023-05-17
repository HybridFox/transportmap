import { ISearchResult } from "@transportmap/types";
import ky from "ky";

export class SearchService {
    public async search(searchParams: Record<string, string | number>): Promise<ISearchResult> {
        return ky.get('/api/v1/search', {
            searchParams
        }).json()
    }
}

export const searchService = new SearchService()
