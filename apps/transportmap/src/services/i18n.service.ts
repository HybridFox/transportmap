import i18n from 'i18next';
import { initReactI18next } from "react-i18next";

i18n
	.use(initReactI18next)
	.init({
		// we init with resources
		resources: {
			en: {
				translations: {
					'SEO.META.DESCRIPTION': 'Waar is Mijn Trein provides real-time locations for passenger trains in Belgium. View train positions, schedules, train numbers, stations, and compositions. Stay updated with the latest train information.'
				},
			},
			nl: {
				translations: {
					'SEO.META.DESCRIPTION': 'Waar is Mijn Trein biedt real-time locatiegegevens van passagierstreinen in België. Bekijk treinposities, dienstregelingen, treinnummers, stations en samenstellingen. Blijf op de hoogte van de laatste treininformatie.'
				},
			},
			fr: {
				translations: {
					'SEO.META.DESCRIPTION': 'Waar is Mijn Trein fournit des informations en temps réel sur les trains de voyageurs en Belgique. Consultez les positions des trains, les horaires, les numéros de train, les gares et les compositions. Restez informé des dernières informations sur les trains.'
				},
			},
			de: {
				translations: {
					'SEO.META.DESCRIPTION': 'Waar is Mijn Trein bietet Echtzeitinformationen zu Personenzügen in Belgien. Sehen Sie sich Zugpositionen, Fahrpläne, Zugnummern, Bahnhöfe und Zusammensetzungen an. Bleiben Sie über die neuesten Zuginformationen auf dem Laufenden.'
				},
			},
		},
		fallbackLng: 'en',
		debug: true,

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
