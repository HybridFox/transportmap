import { Stop, Translation, Trip } from "@transportmap/database";

export const parseTripTranslations = (trip: Trip): any => ({
	...trip,
	stopTimes: trip.stopTimes.map((stopTime) => ({
		...stopTime,
		stop: {
			...stopTime.stop,
			translations: translationsToObject(stopTime.stop.translations)
		}
	}))
});

export const parseStopTranslations = (stop: Partial<Stop>): any => ({
	...stop,
	translations: translationsToObject(stop.translations)
});

const translationsToObject = (translations: Translation[]): Record<string, string> => translations.reduce((acc, translation) => ({
	...acc,
	[translation.language]: translation.translation
}), {})
