import i18n from 'i18next';
import { initReactI18next } from "react-i18next";
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		// we init with resources
		resources: {
			en: {
				translations: {
					'SEO.META.DESCRIPTION': 'Waar is Mijn Trein provides real-time locations for passenger trains in Belgium. View train positions, schedules, train numbers, stations, and compositions. Stay updated with the latest train information.',
					'GENERAL.DEPARTURE': 'Departure',
					'GENERAL.ARRIVAL': 'Arrival',
					'GENERAL.NEXT_STOPS': 'Next Stops',
					'GENERAL.COMPOSITION': 'Composition',
					'GENERAL.SEARCH_TRIP_OR_STOP': 'Search for a trip or stop...'
				},
			},
			nl: {
				translations: {
					'SEO.META.DESCRIPTION': 'Waar is Mijn Trein biedt real-time locatiegegevens van passagierstreinen in België. Bekijk treinposities, dienstregelingen, treinnummers, stations en samenstellingen. Blijf op de hoogte van de laatste treininformatie.','GENERAL.DEPARTURE': 'Vertrek',
					'GENERAL.ARRIVAL': 'Aankomst',
					'GENERAL.NEXT_STOPS': 'Volgende Haltes',
					'GENERAL.COMPOSITION': 'Samenstelling',
					'GENERAL.SEARCH_TRIP_OR_STOP': 'Zoek naar een reis of halte...'
				},
			},
			fr: {
				translations: {
					'SEO.META.DESCRIPTION': 'Waar is Mijn Trein fournit des informations en temps réel sur les trains de voyageurs en Belgique. Consultez les positions des trains, les horaires, les numéros de train, les gares et les compositions. Restez informé des dernières informations sur les trains.',
					'GENERAL.DEPARTURE': 'Départ',
					'GENERAL.ARRIVAL': 'Arrivée',
					'GENERAL.NEXT_STOPS': 'Prochains Arrêts',
					'GENERAL.COMPOSITION': 'Composition',
					'GENERAL.SEARCH_TRIP_OR_STOP': 'Recherchez un voyage ou un arrêt...'
				},
			},
			de: {
				translations: {
					'SEO.META.DESCRIPTION': 'Waar is Mijn Trein bietet Echtzeitinformationen zu Personenzügen in Belgien. Sehen Sie sich Zugpositionen, Fahrpläne, Zugnummern, Bahnhöfe und Zusammensetzungen an. Bleiben Sie über die neuesten Zuginformationen auf dem Laufenden.','GENERAL.DEPARTURE': 'Abfahrt',
					'GENERAL.ARRIVAL': 'Ankunft',
					'GENERAL.NEXT_STOPS': 'Nächste Haltestellen',
					'GENERAL.COMPOSITION': 'Zusammenstellung',
					'GENERAL.SEARCH_TRIP_OR_STOP': 'Suche nach einer Fahrt oder Haltestelle...'
				},
			},
		},
		fallbackLng: 'en',
		debug: true,
		load: 'languageOnly',

		// have a common namespace used around the full app
		ns: ['translations'],
		defaultNS: 'translations',

		interpolation: {
			escapeValue: false, // not needed for react!!
			formatSeparator: ',',
		},

		react: {
			// wait: true
		},
	});

export { i18n }
