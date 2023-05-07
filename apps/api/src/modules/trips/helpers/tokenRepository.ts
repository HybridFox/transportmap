import got from 'got';
import UserAgent from 'user-agents';
import NodeCache from 'node-cache';
const authCodeToken = new NodeCache({ checkperiod: 60 });

class TokenRepository {
	async fetchNewToken() {
		const userAgent = new UserAgent();
		const rawHTML = await got(`https://trainmap.belgiantrain.be`, {
			resolveBodyOnly: true,
			responseType: 'text',
			headers: {
				'User-Agent': userAgent.toString(),
			},
		})

		const key = rawHTML.match(/(?<=localStorage\.setItem\('tmAuthCode', ")([A-Za-z0-9]+)(?="\);)/)[0];
		authCodeToken.set('code', key, 30 * 60);

		return key;
	}

	async getToken(): Promise<string> {
		const cachedToken: string = authCodeToken.get('code');
		if (cachedToken !== undefined) {
			return cachedToken;
		}

		return this.fetchNewToken();
	}
}

export const tokenRepository = new TokenRepository();
