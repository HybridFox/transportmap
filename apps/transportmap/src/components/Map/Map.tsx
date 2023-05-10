/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { FC, useEffect, useRef, useState } from 'react';
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

import { tripsSelector } from '../../store/trips/trips.selectors';
// import { tripsRepository } from '../../store/vehicles/trips.repository';
import { Trip } from '../../store/trips/trips.types';
import { tripsRepository } from '../../store/trips/trips.repository';
import { getVehicleLocation } from '../../helpers/location.utils';
import { highlightPolyline } from '../../helpers/highlight.utils';

import { MAP_ICON_STYLES } from './Map.const';

interface Props {
	userLocation: number[] | null;
	highlightedTrip?: Trip;
}

export const MapComponent: FC<Props> = ({ userLocation, highlightedTrip }: Props) => {
	const mapElement = useRef<HTMLDivElement | null>(null);
	const map = useRef<ol.Map | null>(null);

	const [trips] = useObservable(tripsSelector.trips$);

	const [lat, setLat] = useState(4.5394187);
	const [lon, setLon] = useState(51.119221);
	const [zoom, setZoom] = useState(13);
	const [vectorSource, setVectorSource] = useState<VectorSource>();

	useEffect(() => {
		if (!userLocation || !map.current) {
			return;
		}

		map.current.getView().animate({ center: olProj.transform(userLocation, 'EPSG:4326', 'EPSG:3857'), zoom: 13 })
	}, [userLocation]);

	/**
	 * Handle a trip being selected
	 */
	useEffect(() => {
		if (!highlightedTrip || !map.current) {
			return
		}

		const coordinates = getVehicleLocation(highlightedTrip.sections, highlightedTrip.osrmRoute);
		const vectorLayer = highlightPolyline(highlightedTrip);

		if (!coordinates) {
			return
		}
		
		map.current.addLayer(vectorLayer);
		map.current.getView().animate({ center: olProj.transform(coordinates, 'EPSG:4326', 'EPSG:3857'), zoom: 13.5 })
	}, [highlightedTrip])

	const loadTrainData = () => {
		if (!map.current) {
			return;
		}

		const boundingBoxExtent = olProj.transformExtent(
			map.current.getView().calculateExtent(map.current.getSize()),
			'EPSG:3857',
			'EPSG:4326',
		);

		// [x, y]
		const [west, north] = olExtent.getTopLeft(boundingBoxExtent);
		const [east, south] = olExtent.getBottomRight(boundingBoxExtent);

		tripsRepository.getTrips({ west, north, east, south });
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

			feature.setGeometry(new olGeom.Point(
				olProj.fromLonLat(coordinates),
			))
		});

		map.current?.changed()
		setTimeout(() => moveMarkers(source), 50)
	}

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
		const initialFeaturesLayer = new VectorLayer({
			source,
		});

		// create map
		const initialMap = new ol.Map({
			target: mapElement.current!,
			layers: [
				new TileLayer({
					source: new XYZ({
						url: 'https://{1-5}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
					}),
				}),

				initialFeaturesLayer,
			],
			view: new ol.View({
				center: olProj.fromLonLat([lat, lon]),
				zoom: zoom,
			}),
			controls: [],
		});

		initialMap.addEventListener('moveend', loadTrainData);

		// save map and vector layer references to state
		map.current = initialMap;
		setVectorSource(source);
		moveMarkers(source);

		/**
		 * Make mouse a pointer when hovering over clickable stuff
		 */
		initialMap.on('pointermove', function (evt) {
			if (evt.dragging) {
				return;
			}

			const pixel = initialMap.getEventPixel(evt.originalEvent);
			initialFeaturesLayer.getFeatures(pixel).then((features: any) => {
				const feature = features.length ? features[0] : undefined;
				initialMap.getTargetElement().style.cursor = feature ? 'pointer' : '';
			});
		});

		initialMap.on('click', function (evt) {
			const pixel = initialMap.getEventPixel(evt.originalEvent);

			initialFeaturesLayer.getFeatures(pixel).then((features: any) => {
				const feature = features.length ? features[0] : undefined;
				clearTempLayers();

				if (!feature) {
					return tripsRepository.clearHighlight();
				}

				tripsRepository.highlightTrip(feature.get('id'))
			});
		});

		return () => {
			initialMap.setTarget(undefined);
		};
	}, []);

	useEffect(() => {
		if (!vectorSource) {
			return;
		}

		// TODO: find a way to prevent flicker. Maybe just updating stuff?
		vectorSource.clear();

		vectorSource.addFeatures(
			(trips || [])?.reduce((acc, trip) => {
				// TODO: calculate sectionProgress here? 
				// This would prevent needing to refresh every 5 seconds
				// BUT. We would need to pass all sections. Tho it won't be hard to copy pasta the code from the backend.
				const coordinates = getVehicleLocation(trip.sections, trip.osrmRoute);

				if (!coordinates) {
					return acc;
				}

				const feature = new ol.Feature({
					id: trip.id,
					product: 'vehicle.line?.product',
					mode: trip.route.routeCode.replaceAll(/[0-9]/g, ''),
					lineId: trip.id,
					bearing: trip.bearing,
					speed: trip.speed,
					geometry: new olGeom.Point(
						olProj.fromLonLat(coordinates),
					),
					sections: trip.sections,
					osrmRoute: trip.osrmRoute
				});

				feature.setStyle(MAP_ICON_STYLES(trip)['normal'][trip.route.routeCode.replaceAll(/[0-9]/g, '')]);

				return [...acc, feature];
			}, [] as any[])
		);
	}, [trips]);

	return <div ref={mapElement} className="map-container" style={{ height: '100%' }}></div>;
};
