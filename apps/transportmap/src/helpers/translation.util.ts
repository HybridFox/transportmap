export const getTranslation = (translations: Record<string, string>, locale: string): string => {
	console.log(translations)
	if (!translations) {
		return 'TRANSLATIONS_NOT_FOUND'
	}

	if (translations[locale]) {
		return translations[locale];
	}

	return translations[Object.keys(translations)[0]];
}
