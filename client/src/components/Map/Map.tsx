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

import { MAP_ICON_STYLES } from './Map.const';
import { tripsSelector } from '../../store/vehicles/trips.selectors';
import { useObservable } from '@ngneat/react-rxjs';
// import { tripsRepository } from '../../store/vehicles/trips.repository';
import { StopTime, Trip } from '../../store/vehicles/trips.types';
import ky from 'ky';
import { socket } from '../../modules/core/services/socket.service';
import { getTranslate, railStyleFunction, routeStyleFunction } from '../../helpers/map.utils';
import { SocketEvents } from '../../modules/map/const/socket.const';
import { tripsRepository } from '../../store/vehicles/trips.repository';
import dayjs from 'dayjs';
import { getVehicleLocation } from '../../helpers/location.utils';

export const MapComponent: FC = () => {
	const mapElement = useRef<HTMLDivElement | null>(null);
	const map = useRef<ol.Map | null>(null);

	// const [vehicles] = useObservable(tripsSelector.trips$);
	const [trips, setTrips] = useState<Trip[]>([]);
	const [activeVehicle] = useObservable(tripsSelector.activeTrip$);

	const [lat, setLat] = useState(4.5394187);
	const [lon, setLon] = useState(51.119221);
	const [zoom, setZoom] = useState(13);
	const [vectorSource, setVectorSource] = useState<VectorSource>();


	useEffect(() => {
		function onConnect() {
		//   setIsConnected(true);
		}
	
		function onDisconnect() {
		//   setIsConnected(false);
		}
	
		function onReceiveTrips(value: Trip[]) {
			setTrips(value);
		}
	
		socket.on('connect', onConnect);
		socket.on('disconnect', onDisconnect);
		socket.on(SocketEvents.RCVTRIPS, onReceiveTrips);
	
		return () => {
		  socket.off('connect', onConnect);
		  socket.off('disconnect', onDisconnect);
		  socket.off(SocketEvents.RCVTRIPS, onReceiveTrips);
		};
	}, []);

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

		socket.emit(SocketEvents.SETBBOX, { west, north, east, south })

		// fetchVehicles({
		// 	north: north,
		// 	west: west,
		// 	east: east,
		// 	south: south,
		// });
	};

	/**
	 * Animate markers
	 * TODO: Move this on a line. Duh
	 */
	const moveMarkers = (source: VectorSource) => {
		// TODO: clean this up
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
	 * Load GeoJSON
	 * TODO: maybe we want this, but in a simpler style tho. And we don't want to use `lijnsecties`. Maybe we can look at something like mapbox? Expensive tho.
	 */
	useEffect(() => {
		(async () => {
			const geojson: any = await ky.get('/static/lijnsecties.geojson').json();
			
			const vectorSource = new VectorSource({
				features: new GeoJSON().readFeatures(geojson, { featureProjection: 'EPSG:3857' }), 
			});
	
			const vectorLayer = new VectorLayer({
				source: vectorSource,
				style: railStyleFunction,
			});
	
			map.current?.addLayer(vectorLayer);
		})();
	}, []);

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

		// initialMap.addEventListener('moveend', loadTrainData);

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
					return tripsRepository.clearActive();
				}

				tripsRepository.getTrip(feature.get('id'))
					.then((activeTrip) => {
						const stopTimes: StopTime[] = feature.get('stopTimes');

						const coordinates = activeTrip.osrmRoute.reduce((acc, leg) => {
							return [
								...acc,
								...leg.steps.reduce((stepAcc, step) => ([...stepAcc, ...step.geometry.coordinates]), [] as number[][])
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
									...stopTimes.map((stopTime) => ({
										type: 'Feature',
										geometry: {
											type: 'Point',
											coordinates: [
												stopTime.stop.longitude,
												stopTime.stop.latitude,
											],
										},
										properties: {
											name: stopTime.stop.name,
										},
									})),
								],
							}, {
								dataProjection: 'EPSG:4326',
								featureProjection: 'EPSG:3857',
							}),
						});

						const tempLayer = new VectorLayer({
							source: tempSource,
							style: routeStyleFunction,
							properties: {
								tempLayer: true,
							},
						});

						initialMap.addLayer(tempLayer);
					})
			});
		});

		// setInterval(loadTripData, 5000);
		loadTrainData();

		return () => {
			initialMap.setTarget(undefined);
		};
	}, []);

	useEffect(() => {

	}, [activeVehicle])

	useEffect(() => {
		if (!vectorSource) {
			return;
		}

		// TODO: find a way to prevent flicker. Maybe just updating stuff?
		vectorSource.clear();
		const currentTime = dayjs().format('HH:mm:ss');

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
					stopTimes: trip.stopTimes,
					bearing: trip.bearing,
					speed: trip.speed,
					geometry: new olGeom.Point(
						olProj.fromLonLat(coordinates),
					),
					sections: trip.sections,
					osrmRoute: trip.osrmRoute
				});

				feature.setStyle(MAP_ICON_STYLES()['normal'][trip.route.routeCode.replaceAll(/[0-9]/g, '')]);

				return [...acc, feature];
			}, [] as any[])
		);
	}, [trips]);

	return <div ref={mapElement} className="map-container" style={{ height: '100%' }}></div>;
};
