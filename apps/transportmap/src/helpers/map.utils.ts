
import { Stroke, Style, Fill, Circle, Text } from 'ol/style';
import * as ol from 'ol';
import {getStopMarkerStyle} from "./stop-marker.utils";

export const railStyles = (feature: ol.Feature, locale: string) => ({
	LineString: new Style({
		stroke: new Stroke({
			color: 'rgba(0, 0, 0, 0.5)',
			width: 5,
		}),
	}),
});

export const routeStyles = (feature: ol.Feature, locale: string) => ({
	LineString: new Style({
		stroke: new Stroke({
			color: 'rgba(0, 0, 0, 0.5)',
			width: 5,
		}),
	}),
});

export const routeStyleFunction = (locale: string) => (feature: any) => {
	// console.log('1', feature.getGeometry().getType())
	return routeStyles(feature, locale)[feature.getGeometry().getType() as keyof typeof routeStyles];
};

export const railStyleFunction = (feature: any, locale: string) => {
	// console.log('1', feature.getGeometry().getType())
	return railStyles(feature, locale)[feature.getGeometry().getType() as keyof typeof railStyles];
};

export const radians = (degrees: number) => {
	return degrees * Math.PI / 180;
};

export const getTranslate = (angle: number, distance: number) => {
	const rad = radians(angle % 360);
  
	return [distance * Math.sin(rad), distance * Math.cos(rad)];
}
