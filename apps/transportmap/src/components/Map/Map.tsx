/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, {FC, useEffect, useRef, useState} from 'react';
import * as ol from 'ol';
import * as olProj from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import * as olExtent from 'ol/extent';
import * as olGeom from 'ol/geom';
import {GeoJSON} from 'ol/format';
import {useObservable} from '@ngneat/react-rxjs';
import * as olStyle from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import {useTranslation} from 'react-i18next';
import {ICalculatedTrip, SectionType} from '@transportmap/types';

import {tripsSelector} from '../../store/trips/trips.selectors';
import {tripsRepository} from '../../store/trips/trips.repository';
import {getVehicleLocation} from '../../helpers/location.utils';
import {highlightPolyline} from '../../helpers/highlight.utils';
import {uiRepository} from '../../store/ui/ui.repository';
import {getTripMarkerStyle, TRIP_MARKER_STATE} from "../../helpers/marker.utils";
import {stopsSelector} from "../../store/stops/stops.selectors";
import {getStopMarkerStyle, STOP_MARKER_STATE} from "../../helpers/stop-marker.utils";
import dayjs from "dayjs";

interface Props {
	highlightedTrip?: ICalculatedTrip;
	map: React.MutableRefObject<ol.Map | null>;
}

enum FocusObjects {
	USER_LOCATION,
	TRIP,
}

export const MapComponent: FC<Props> = ({ highlightedTrip, map }: Props) => {
	const mapElement = useRef<HTMLDivElement | null>(null);
	const focusedObject = useRef<FocusObjects | null>(null);
	const tripMarkerSource = useRef<VectorSource | null>();
	const stopMarkerSource = useRef<VectorSource | null>();
	const [t, i18n] = useTranslation();

	const [trips] = useObservable(tripsSelector.trips$);
	const [stops] = useObservable(stopsSelector.stops$);
	const [userLocationEnabled] = useObservable(uiRepository.userLocationEnabled$);

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

		const coordinates = getVehicleLocation(highlightedTrip.sections);
		const vectorLayer = highlightPolyline(highlightedTrip, i18n.language);
		const tripStopIds = highlightedTrip.sections.filter((section) => section.type === SectionType.STOP).map((section) => section.stop!.id);

		stopMarkerSource.current!.getFeatures().forEach((feature, i) => {
			if (tripStopIds.includes(feature.get('id'))) {
				const section = highlightedTrip.sections.find((section) => section?.stop?.id === feature.get('id'));

				if (!section) {
					return;
				}

				const minutesDelay = dayjs(`${dayjs().tz('Europe/Brussels').format('DD/MM/YYYY')} ${section?.realtimeEndTime || section?.endTime}`, 'DD/MM/YYYY HH:mm:ss')
					.diff(dayjs(`${dayjs().tz('Europe/Brussels').format('DD/MM/YYYY')} ${section?.endTime}`, 'DD/MM/YYYY HH:mm:ss'), 'minutes');
				return feature.setStyle(getStopMarkerStyle(feature.get('stop'), i + 50, STOP_MARKER_STATE.DEFAULT, i18n.language, minutesDelay));
			}

			feature.setStyle(getStopMarkerStyle(feature.get('stop'), i + 50, STOP_MARKER_STATE.SUPPRESSED, i18n.language));
		})

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
			const coordinates = getVehicleLocation(sections);

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
		stopMarkerSource.current!.getFeatures().forEach((feature, i) => {
			feature.setStyle(getStopMarkerStyle(feature.get('stop'), i + 50, STOP_MARKER_STATE.DEFAULT, i18n.language));
		})
	};

	/**
	 * Initialise map
	 */
	useEffect(() => {
		const tripSource = new VectorSource({
			format: new GeoJSON(),
		})

		const stopSource = new VectorSource({
			format: new GeoJSON(),
		});

		// create and add vector source layer
		const tripMarkerLayer = new VectorLayer({
			source: tripSource,
			zIndex: 5,
		});

		const stopMarkerLayer = new VectorLayer({
			source: stopSource,
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
				stopMarkerLayer,
				tripMarkerLayer,
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
		tripMarkerSource.current = tripSource;
		stopMarkerSource.current = stopSource;
		moveMarkers(tripSource);

		/**
		 * Make mouse a pointer when hovering over clickable stuff
		 */
		initialMap.on('pointermove', function (evt) {
			if (evt.dragging) {
				return;
			}

			const pixel = initialMap.getEventPixel(evt.originalEvent);
			tripMarkerLayer.getFeatures(pixel).then((features: any) => {
				const feature = features.length ? features[0] : undefined;
				initialMap.getTargetElement().style.cursor = feature ? 'pointer' : '';
			});
		});

		initialMap.on('click', function (evt) {
			const pixel = initialMap.getEventPixel(evt.originalEvent);
			focusedObject.current = null;

			tripMarkerLayer.getFeatures(pixel).then((features: any) => {
				const feature = features.length ? features[0] : undefined;
				clearTempLayers();

				if (!feature) {
					tripMarkerSource.current!.getFeatures().forEach((feature, i) => {
						feature.setStyle(getTripMarkerStyle(feature.get('trip'), i, TRIP_MARKER_STATE.DEFAULT));
						feature.set('highlighted', false);
					});
					return tripsRepository.clearHighlight();
				}

				tripMarkerSource.current!.getFeatures().forEach((feature, i) => {
					feature.setStyle(getTripMarkerStyle(feature.get('trip'), i, TRIP_MARKER_STATE.SUPPRESSED));
					feature.set('highlighted', false);
				});
				feature.setStyle(getTripMarkerStyle(feature.get('trip'), 5000, TRIP_MARKER_STATE.HIGHLIGHTED));
				feature.set('highlighted', true);
				tripsRepository.highlightTrip(feature.get('id'));
			});
		});

		return () => {
			initialMap.setTarget(undefined);
		};
	}, []);

	useEffect(() => {
		if (!tripMarkerSource) {
			return;
		}

		const leftOverFeatures = (trips || []).reduce((existingFeatures, trip, i) => {
			const existingFeature = existingFeatures.find((feature) => feature.get('id') === trip.id);

			if (existingFeature) {
				existingFeature.set('sections', trip.sections);
				return existingFeatures.filter((feature) => feature.get('id') !== trip.id);
			}

			const coordinates = getVehicleLocation(trip.sections);

			if (!coordinates) {
				return existingFeatures;
			}

			const feature = new ol.Feature({
				id: trip.id,
				mode: trip.route.routeCode.replaceAll(/[0-9]/g, ''),
				lineId: trip.id,
				geometry: new olGeom.Point(olProj.fromLonLat(coordinates)),
				sections: trip.sections,
				trip: trip,
			});

			feature.setStyle(getTripMarkerStyle(trip, i, highlightedTrip && highlightedTrip?.id !== trip.id ? TRIP_MARKER_STATE.SUPPRESSED : TRIP_MARKER_STATE.DEFAULT));

			tripMarkerSource.current!.addFeature(feature);
			return existingFeatures;
		}, tripMarkerSource.current!.getFeatures());

		leftOverFeatures.forEach((feature) => {
			feature.dispose();
			tripMarkerSource.current!.removeFeature(feature);
		});
	}, [trips]);

	useEffect(() => {
		if (!tripMarkerSource) {
			return;
		}

		tripMarkerSource.current!.getFeatures().forEach((feature) => tripMarkerSource.current!.removeFeature(feature))
		stops.forEach((stop, i) => {
			const feature = new ol.Feature({
				id: stop.id,
				geometry: new olGeom.Point(olProj.fromLonLat([stop.longitude, stop.latitude])),
				stop: stop,
			});

			feature.setStyle(getStopMarkerStyle(stop, i, STOP_MARKER_STATE.DEFAULT, i18n.language));
			stopMarkerSource.current!.addFeature(feature);
		})
	}, [stops]);

	return <div ref={mapElement} className="map-container" style={{ height: '100%' }}></div>;
};
