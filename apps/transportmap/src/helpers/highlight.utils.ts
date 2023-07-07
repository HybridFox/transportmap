import * as polyline from '@mapbox/polyline';
import VectorSource from 'ol/source/Vector';
import { GeoJSON } from 'ol/format';
import VectorLayer from 'ol/layer/Vector';
import { ICalculatedTrip, SectionType } from '@transportmap/types';

import { routeStyleFunction } from './map.utils';
import { getTranslation } from './translation.util';

export const highlightPolyline = (trip: ICalculatedTrip, locale: string): VectorLayer<VectorSource> => {
	const coordinates = trip.sections.filter((section) => section.type === SectionType.TRAVEL).reduce((acc, section) => {
		return [
			...acc,
			...polyline.decode(section.polyline).map(([latitude, longitude]) => [longitude, latitude])
		]
	}, [] as number[][]);

	const tempSource = new VectorSource({
		features: new GeoJSON().readFeatures({
			type: 'FeatureCollection',
			features: [
				{
					type: 'Feature',
					geometry: {
						type: 'LineString',
						coordinates: coordinates,
					},
				},
				...trip.sections.filter((section) => section.type === SectionType.STOP).map((section) => ({
					type: 'Feature',
					geometry: {
						type: 'Point',
						coordinates: [
							section.stop!.longitude,
							section.stop!.latitude,
						],
					},
					properties: {
						name: getTranslation(section.stop!.translations, locale) || section?.stop?.name,
					},
				})),
			],
		}, {
			dataProjection: 'EPSG:4326',
			featureProjection: 'EPSG:3857',
		}),
	});

	return new VectorLayer({
		source: tempSource,
		style: routeStyleFunction,
		properties: {
			tempLayer: true,
		},
	});
}
