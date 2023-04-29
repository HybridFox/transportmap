import fetch from 'node-fetch';
import * as UserAgent from 'user-agents';
import * as NodeCache from 'node-cache';
const authCodeToken = new NodeCache({ checkperiod: 60 });

class TokenRepository {
	async fetchNewToken() {
		const userAgent = new UserAgent();
		console.log('NEW TOKEN PLS', userAgent.toString());
		const rawHTML = await fetch(`https://trainmap.belgiantrain.be`, {
			headers: {
				'User-Agent': userAgent.toString(),
			},
		}).then((response) => response.text());

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
