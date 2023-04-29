import { Injectable } from '@nestjs/common';
import * as NodeCache from 'node-cache';
import fetch from 'node-fetch';
// import { gotInstance } from '../helpers/got';
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

		console.log('get comp');
		const composition = await fetch(`https://trainmap.belgiantrain.be/data/composition/${compositionId}`, {
			headers: {
				'auth-code': (await tokenRepository.getToken()) as string,
			},
		})
			.then((response) => response.json())
			.catch(async () => {
				return fetch(`https://trainmap.belgiantrain.be/data/composition/${compositionId}`, {
					headers: {
						'auth-code': (await tokenRepository.fetchNewToken()) as string,
					},
				}).then((response) => response.json());
			})
			.catch((e) => console.log(e.response.body));

		this.nodeCache.set(`COMPOSITIONS:${compositionId}`, JSON.stringify(composition));

		return composition;
	}
}
