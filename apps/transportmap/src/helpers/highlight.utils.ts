import * as polyline from '@mapbox/polyline';
import VectorSource from 'ol/source/Vector';
import { GeoJSON } from 'ol/format';
import VectorLayer from 'ol/layer/Vector';

import { Trip } from "../store/trips/trips.types";

import { routeStyleFunction } from './map.utils';
import { getTranslation } from './translation.util';

export const highlightPolyline = (trip: Trip, locale: string): VectorLayer<VectorSource> => {
	const coordinates = trip.osrmRoute.reduce((acc, leg) => {
		return [
			...acc,
			...polyline.decode(leg).map(([latitude, longitude]) => [longitude, latitude])
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
				...trip.stopTimes.map((stopTime) => ({
					type: 'Feature',
					geometry: {
						type: 'Point',
						coordinates: [
							stopTime.stop.longitude,
							stopTime.stop.latitude,
						],
					},
					properties: {
						name: getTranslation(stopTime.stop.translations, locale),
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
