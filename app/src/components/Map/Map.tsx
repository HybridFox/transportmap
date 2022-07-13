/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { FC, useEffect, useRef, useState } from 'react';
import { useObservable } from 'react-use-observable';
import * as ol from 'ol';
import * as olProj from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import * as olExtent from 'ol/extent';
import * as olGeom from 'ol/geom';
import { GeoJSON } from 'ol/format';
import { Observable } from 'rxjs';
import { Stroke, Style, Fill, Circle, Text } from 'ol/style';
import CircleStyle from 'ol/style/Circle';

import { vehicleQuery } from '../../store/vehicle/vehicle.query';
import { clearVehicle, fetchVehicle, fetchVehicles } from '../../store/vehicle/vehicle.service';
import { VehicleModel } from '../../store/vehicle/vehicle.model';

import { MAP_ICON_STYLES } from './Map.const';

const styles = (feature: ol.Feature) => ({
	LineString: new Style({
		stroke: new Stroke({
			color: 'green',
			width: 5,
		}),
	}),
	Point: new Style({
		image: new Circle({
			radius: 7,
			fill: new Fill({ color: 'black' }),
			stroke: new Stroke({
				color: [255, 0, 0],
				width: 2,
			}),
		}),
		text: new Text({
			text: feature.get('name'),
			font: '20px bold sans-serif',
			offsetY: -20,
			overflow: true,
		}),
	}),
});

const styleFunction = (feature: any) => {
	return styles(feature)[feature.getGeometry().getType() as keyof typeof styles];
};

export const MapComponent: FC = () => {
	const mapElement = useRef<HTMLDivElement | null>(null);
	const map = useRef<ol.Map | null>(null);

	const [vehicles] = useObservable(() => vehicleQuery.selectAll(), []);
	const [activeVehicle] = useObservable(() => vehicleQuery.selectActive() as Observable<VehicleModel>, []);

	const [lat, setLat] = useState(4.5394187);
	const [lon, setLon] = useState(51.119221);
	const [zoom, setZoom] = useState(13);
	const [vectorSource, setVectorSource] = useState<VectorSource>();

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

		fetchVehicles({
			north: north,
			west: west,
			east: east,
			south: south,
		});
	};

	useEffect(() => {
		if (!activeVehicle?.trip?.polyline) {
			return;
		}

		const vectorSource = new VectorSource({
			features: new GeoJSON().readFeatures(activeVehicle?.trip?.polyline || {}),
		});

		const vectorLayer = new VectorLayer({
			source: vectorSource,
			style: styleFunction,
		});

		map.current?.addLayer(vectorLayer);
	}, [activeVehicle]);

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
						url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
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

		// save map and vector layer references to state
		map.current = initialMap;
		setVectorSource(source);

		initialMap.addEventListener('moveend', loadTrainData);

		initialMap.on('pointermove', function (evt) {
			if (evt.dragging) {
				return;
			}

			const pixel = initialMap.getEventPixel(evt.originalEvent);
			initialFeaturesLayer.getFeatures(pixel).then((features: ol.Feature[]) => {
				const feature = features.length ? features[0] : undefined;
				initialMap.getTargetElement().style.cursor = feature ? 'pointer' : '';
			});
		});

		initialMap.on('click', function (evt) {
			const pixel = initialMap.getEventPixel(evt.originalEvent);

			initialFeaturesLayer.getFeatures(pixel).then((features: ol.Feature[]) => {
				const feature = features.length ? features[0] : undefined;

				if (feature) {
					console.log(feature.get('lineGeo'));
					const tempSource = new VectorSource({
						features: new GeoJSON().readFeatures(feature.get('lineGeo'), {
							dataProjection: 'EPSG:4326',
							featureProjection: 'EPSG:3857',
						}),
					});

					const tempLayer = new VectorLayer({
						source: tempSource,
						style: styleFunction,
					});

					initialMap.addLayer(tempLayer);

					return fetchVehicle(feature.get('lineId'));
				}

				return clearVehicle();
			});
		});

		setInterval(loadTrainData, 15000);

		return () => {
			initialMap.setTarget(undefined);
		};
	}, []);

	useEffect(() => {
		if (!vectorSource) {
			return;
		}

		vectorSource.clear();

		vectorSource.addFeatures(
			(vehicles || [])?.map((vehicle) => {
				const feature = new ol.Feature({
					id: vehicle.line?.id,
					product: vehicle.line?.product,
					mode: vehicle.line?.mode,
					lineId: vehicle.line?.id,
					lineGeo: vehicle.lineGeo,
					geometry: new olGeom.Point(
						olProj.fromLonLat([
							vehicle.projectedLocation!.longitude!,
							vehicle.projectedLocation!.latitude!,
						]),
					),
				});

				feature.setStyle(MAP_ICON_STYLES()['normal'][vehicle.line?.product as any]);

				return feature;
			}),
		);

		// vectorSource.addFeatures(
		// 	(vehicles || [])?.map((vehicle) => {
		// 		const feature = new ol.Feature({
		// 			id: vehicle.line?.id,
		// 			product: vehicle.line?.product,
		// 			mode: vehicle.line?.mode,
		// 			lineId: vehicle.line?.id,
		// 			geometry: new olGeom.Point(
		// 				olProj.fromLonLat([vehicle.location!.longitude!, vehicle.location!.latitude!]),
		// 			),
		// 		});

		// 		feature.setStyle(MAP_ICON_STYLES()['ghost'][vehicle.line?.product as any]);

		// 		return feature;
		// 	}),
		// );
	}, [vehicles]);

	return <div ref={mapElement} className="map-container" style={{ height: '100%' }}></div>;
};
