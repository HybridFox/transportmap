import got from 'got';

import { tokenRepository } from './tokenRepository';

export const gotInstance = got.extend({
	hooks: {
		afterResponse: [
			async (response, retryWithMergedOptions) => {
				if (response.statusCode === 401) {
					console.log(await tokenRepository.fetchNewToken())
					// Unauthorized
					const updatedOptions = {
						headers: {
							'auth-code': await tokenRepository.fetchNewToken(),
						},
					};

					// Save for further requests
					gotInstance.defaults.options = {
						...gotInstance.defaults.options,
						...updatedOptions,
					} as any;

					// Make a new retry
					return retryWithMergedOptions(updatedOptions);
				}

				// No changes otherwise
				return response;
			},
		],
		beforeError: [
			(error) => {
				console.error(error);
				return error;
			},
		],
	},
	mutableDefaults: true,
});
