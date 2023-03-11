import got from 'got';

import { tokenRepository } from './tokenRepository';

export const gotInstance = got.extend({
	hooks: {
		afterResponse: [
			async (response, retryWithMergedOptions) => {
				if (response.statusCode === 401) {
					// Unauthorized
					const updatedOptions = {
						headers: {
							Authorization: await tokenRepository.fetchNewToken(),
						},
					};

					// Save for further requests
					gotInstance.defaults.options = got.mergeOptions(gotInstance.defaults.options, updatedOptions);

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
