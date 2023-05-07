import { Injectable } from '@nestjs/common';
import NodeCache from 'node-cache';

import { gotInstance } from '../helpers/got';
import { tokenRepository } from '../helpers/tokenRepository';

@Injectable()
export class CompositionService {
	private nodeCache: NodeCache;

	constructor() {
		this.nodeCache = new NodeCache({ stdTTL: 60 * 60, checkperiod: 60 });
	}

	public async getCachedComposition(compositionId: string): Promise<any> {
		const cachedComposition: string = this.nodeCache.get(`COMPOSITIONS:${compositionId}`);

		if (cachedComposition) {
			return JSON.parse(cachedComposition);
		}

		console.log('get comp', `https://trainmap.belgiantrain.be/data/composition/${compositionId}`);
		const composition = await gotInstance(`https://trainmap.belgiantrain.be/data/composition/${compositionId}`, {
			resolveBodyOnly: true,
			responseType: 'json',
			headers: {
				'auth-code': await tokenRepository.getToken()
			}
		})
			.catch((e) => console.log(e.response.body));

		this.nodeCache.set(`COMPOSITIONS:${compositionId}`, JSON.stringify(composition));

		return composition;
	}
}
