export const getTranslation = (translations?: Record<string, string>, locale?: string): string => {
	if (!translations) {
		return 'TRANSLATIONS_NOT_FOUND'
	}

	if (translations[locale || 0]) {
		return translations[locale || 0];
	}

	return translations[Object.keys(translations)[0]];
}
