import { Injectable } from '@nestjs/common';
import * as NodeCache from 'node-cache';
import { gotInstance } from '../helpers/got';
import { tokenRepository } from '../helpers/tokenRepository';

@Injectable()
export class CompositionService {
	private nodeCache: NodeCache;

	constructor() {
		this.nodeCache = new NodeCache({ stdTTL: 60 * 60, checkperiod: 60 });
	}

	public async getCachedComposition(compositionId: string): Promise<any> {
		const cachedComposition: string = this.nodeCache.get(`composition:${compositionId}`);

		if (cachedComposition) {
			return JSON.parse(cachedComposition);
		}

		const composition = await gotInstance
			.get(`https://trainmap.belgiantrain.be/data/composition/${compositionId}`, {
				headers: {
					'auth-code': (await tokenRepository.getToken()) as string,
				},
				resolveBodyOnly: true,
				responseType: 'json',
			})
			.catch((e) => {
				console.log(e.response.body);
			});

		this.nodeCache.set(`composition:${compositionId}`, JSON.stringify(composition));

		return composition;
	}
}
