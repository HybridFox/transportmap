/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { FC, useContext, useEffect, useRef, useState } from 'react';
import * as ol from 'ol';
import * as olProj from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import * as olExtent from 'ol/extent';
import * as olGeom from 'ol/geom';
import { GeoJSON } from 'ol/format';
import { useObservable } from '@ngneat/react-rxjs';
import * as olStyle from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import { useTranslation } from 'react-i18next';

import { tripsSelector } from '../../store/trips/trips.selectors';
// import { tripsRepository } from '../../store/vehicles/trips.repository';
import { Trip } from '../../store/trips/trips.types';
import { tripsRepository } from '../../store/trips/trips.repository';
import { getVehicleLocation } from '../../helpers/location.utils';
import { highlightPolyline } from '../../helpers/highlight.utils';
import { uiRepository } from '../../store/ui/ui.repository';

import { MAP_ICON_STYLES } from './Map.const';

interface Props {
	highlightedTrip?: Trip;
	map: React.MutableRefObject<ol.Map | null>;
}

enum FocusObjects {
	USER_LOCATION,
	TRIP,
}

export const MapComponent: FC<Props> = ({ highlightedTrip, map }: Props) => {
	const mapElement = useRef<HTMLDivElement | null>(null);
	const focusedObject = useRef<FocusObjects | null>(null);
	const [t, i18n] = useTranslation();

	const [trips] = useObservable(tripsSelector.trips$);
	const [userLocationEnabled] = useObservable(uiRepository.userLocationEnabled$);

	const [markerSource, setMarkerSource] = useState<VectorSource>();
	const [geolocation, setGeolocation] = useState<ol.Geolocation>();

	useEffect(() => {
		if (!map.current || !geolocation) {
			return;
		}

		geolocation.setTracking(userLocationEnabled);
		map.current.getLayers().forEach((layer) => layer.getProperties().userLocationLayer && layer.setVisible(userLocationEnabled));
		focusedObject.current = FocusObjects.USER_LOCATION;
	}, [userLocationEnabled]);

	/**
	 * Handle a trip being selected
	 */
	useEffect(() => {
		if (!highlightedTrip || !map.current) {
			return;
		}

		const coordinates = getVehicleLocation(highlightedTrip.sections, highlightedTrip.osrmRoute);
		const vectorLayer = highlightPolyline(highlightedTrip, i18n.language);

		if (!coordinates) {
			return;
		}

		map.current.addLayer(vectorLayer);
		focusedObject.current = FocusObjects.TRIP;
	}, [highlightedTrip]);

	const loadTrainData = () => {
		if (!map.current) {
			return;
		}

		const boundingBoxExtent = olProj.transformExtent(map.current.getView().calculateExtent(map.current.getSize()), 'EPSG:3857', 'EPSG:4326');

		// [x, y]
		const [west, north] = olExtent.getTopLeft(boundingBoxExtent);
		const [east, south] = olExtent.getBottomRight(boundingBoxExtent);

		tripsRepository.getTrips({
			west: west - 0.1,
			north: north + 0.1,
			east: east + 0.1,
			south: south - 0.1,
		});
	};

	/**
	 * Animate markers
	 */
	const moveMarkers = (source: VectorSource) => {
		source?.forEachFeature((feature) => {
			const sections = feature.get('sections');
			const osrmRoute = feature.get('osrmRoute');

			const coordinates = getVehicleLocation(sections, osrmRoute);

			if (!coordinates) {
				return;
			}

			feature.setGeometry(new olGeom.Point(olProj.fromLonLat(coordinates)));
		});

		map.current?.changed();
		setTimeout(() => moveMarkers(source), 50);
	};

	const clearTempLayers = () => {
		map.current!.getLayers().forEach((layer) => {
			if (!layer.getProperties().tempLayer) {
				return;
			}

			layer.dispose();
		});
	};

	/**
	 * Initialise map
	 */
	useEffect(() => {
		const source = new VectorSource({
			format: new GeoJSON(),
		});

		// create and add vector source layer
		const markerLayer = new VectorLayer({
			source,
			zIndex: 5,
		});

		const view = new ol.View({
			center: olProj.fromLonLat([4.4004697, 51.2132694]),
			zoom: 13,
		});

		const geo = new ol.Geolocation({
			// enableHighAccuracy must be set to true to have the heading value.
			trackingOptions: {
				enableHighAccuracy: true,
			},
			projection: view.getProjection(),
		});
		setGeolocation(geo);

		const accuracyFeature = new ol.Feature();
		geo.on('change:accuracyGeometry', () => {
			accuracyFeature.setGeometry(geo.getAccuracyGeometry()!);
		});

		geo.on('error', (err) => {
			uiRepository.setUserLocationEnabled(false);
			alert(err.message);
		});

		const positionFeature = new ol.Feature();
		positionFeature.setStyle(
			new olStyle.Style({
				image: new CircleStyle({
					radius: 6,
					fill: new olStyle.Fill({
						color: '#3399CC',
					}),
					stroke: new olStyle.Stroke({
						color: '#fff',
						width: 2,
					}),
				}),
			}),
		);

		geo.on('change:position', () => {
			const coordinates = geo.getPosition();

			if (!coordinates) {
				return;
			}

			if (focusedObject.current === FocusObjects.USER_LOCATION) {
				initialMap.getView().animate({ center: coordinates, zoom: 13.5 });
			}

			positionFeature.setGeometry(new olGeom.Point(coordinates));
		});

		const positionLayer = new VectorLayer({
			properties: {
				userLocationLayer: true,
			},
			source: new VectorSource({
				features: [accuracyFeature, positionFeature],
			}),
		});

		// create map
		const initialMap = new ol.Map({
			target: mapElement.current!,
			layers: [
				new TileLayer({
					source: new XYZ({
						url: 'https://{1-5}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
						attributions: ['&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>'],
					}),
				}),
				markerLayer,
				positionLayer,
			],
			view,
			// controls: [],
		});

		initialMap.addEventListener('moveend', loadTrainData);
		initialMap.addEventListener('pointerdrag', () => {
			focusedObject.current = null;
		});

		// save map and vector layer references to state
		map.current = initialMap;
		setMarkerSource(source);
		moveMarkers(source);

		/**
		 * Make mouse a pointer when hovering over clickable stuff
		 */
		initialMap.on('pointermove', function (evt) {
			if (evt.dragging) {
				return;
			}

			const pixel = initialMap.getEventPixel(evt.originalEvent);
			markerLayer.getFeatures(pixel).then((features: any) => {
				const feature = features.length ? features[0] : undefined;
				initialMap.getTargetElement().style.cursor = feature ? 'pointer' : '';
			});
		});

		initialMap.on('click', function (evt) {
			const pixel = initialMap.getEventPixel(evt.originalEvent);
			focusedObject.current = null;

			markerLayer.getFeatures(pixel).then((features: any) => {
				const feature = features.length ? features[0] : undefined;
				clearTempLayers();

				if (!feature) {
					return tripsRepository.clearHighlight();
				}

				tripsRepository.highlightTrip(feature.get('id'));
			});
		});

		return () => {
			initialMap.setTarget(undefined);
		};
	}, []);

	useEffect(() => {
		if (!markerSource) {
			return;
		}

		const leftOverFeatures = (trips || []).reduce((existingFeatures, trip, i) => {
			const existingFeature = existingFeatures.find((feature) => feature.get('id') === trip.id);

			if (existingFeature) {
				existingFeature.set('sections', trip.sections);
				return existingFeatures.filter((feature) => feature.get('id') !== trip.id);
			}

			const coordinates = getVehicleLocation(trip.sections, trip.osrmRoute);

			if (!coordinates) {
				return existingFeatures;
			}

			const feature = new ol.Feature({
				id: trip.id,
				mode: trip.route.routeCode.replaceAll(/[0-9]/g, ''),
				lineId: trip.id,
				geometry: new olGeom.Point(olProj.fromLonLat(coordinates)),
				sections: trip.sections,
				osrmRoute: trip.osrmRoute,
			});

			feature.setStyle(MAP_ICON_STYLES(trip, i)['normal'][trip.route.routeCode.replaceAll(/[0-9]/g, '')]);

			markerSource.addFeature(feature);
			return existingFeatures;
		}, markerSource.getFeatures());

		leftOverFeatures.forEach((feature) => feature.dispose());
	}, [trips]);

	return <div ref={mapElement} className="map-container" style={{ height: '100%' }}></div>;
};
