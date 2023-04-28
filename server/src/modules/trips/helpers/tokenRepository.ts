import got from 'got/dist/source';
import * as NodeCache from 'node-cache';
const authCodeToken = new NodeCache({ checkperiod: 60 });

class TokenRepository {
	async fetchNewToken() {
		console.log('NEW TOKEN PLS');
		const rawHTML = await got.get<string>(`https://trainmap.belgiantrain.be`, {
			resolveBodyOnly: true,
		});

		console.log('rawHTML', rawHTML);
		const key = rawHTML.match(/(?<=localStorage\.setItem\('tmAuthCode', ")([A-Za-z0-9]+)(?="\);)/)[0];
		authCodeToken.set('code', key, 30 * 60);

		return key;
	}

	async getToken() {
		const cachedToken = authCodeToken.get('code');
		if (cachedToken !== undefined) {
			return cachedToken;
		}

		return this.fetchNewToken();
	}
}

export const tokenRepository = new TokenRepository();
