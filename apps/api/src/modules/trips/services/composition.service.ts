import { Injectable } from '@nestjs/common';
import { MongoRepository } from 'typeorm';
import { Composition, mongoDataSource } from '@transportmap/database';

import { gotInstance } from '../helpers/got';
import { tokenRepository } from '../helpers/tokenRepository';

@Injectable()
export class CompositionService {
	private compositionRepository: MongoRepository<Composition>;

	constructor() {
		this.compositionRepository = mongoDataSource.getMongoRepository(Composition);
	}

	public async getCachedComposition(compositionId: string): Promise<any> {
		const cachedComposition = await this.compositionRepository.findOne({
			where: {
				id: compositionId
			}
		});

		if (cachedComposition) {
			return cachedComposition.composition;
		}

		console.log('get comp', `https://trainmap.belgiantrain.be/data/composition/${compositionId}`, cachedComposition);
		const composition = await gotInstance<Composition>(`https://trainmap.belgiantrain.be/data/composition/${compositionId}`, {
			resolveBodyOnly: true,
			responseType: 'json',
			headers: {
				'auth-code': await tokenRepository.getToken()
			}
		})
			.catch((e) => console.log(e.response.body));

		await this.compositionRepository.insertOne({
			id: compositionId,
			composition
		});

		return composition;
	}
}
