
import { Stroke, Style, Fill, Circle, Text } from 'ol/style';
import * as ol from 'ol';

export const railStyles = (feature: ol.Feature) => ({
	LineString: new Style({
		stroke: new Stroke({
			color: 'rgba(0, 0, 0, 0.5)',
			width: 5,
		}),
	}),
	Point: new Style({
		image: new Circle({
			radius: 7,
			fill: new Fill({ color: '#e6e6e6' }),
			stroke: new Stroke({
				color: '#212121',
				width: 5,
			}),
		}),
		text: new Text({
			text: feature.get('name'),
			font: 'bold 15px Prompt',
			offsetY: -20,
			overflow: true,
			fill: new Fill({ color: '#e6e6e6' }),
			stroke: new Stroke({
				color: '#212121',
				width: 5,
			}),
		}),
	}),
});

export const routeStyles = (feature: ol.Feature) => ({
	LineString: new Style({
		stroke: new Stroke({
			color: 'rgba(0, 0, 0, 0.5)',
			width: 5,
		}),
	}),
	Point: new Style({
		image: new Circle({
			radius: 7,
			fill: new Fill({ color: 'rgba(0, 0, 0, 1)' }),
			// stroke: new Stroke({
			// 	color: '#212121',
			// 	width: 5,
			// }),
		}),
		text: new Text({
			text: feature.get('name'),
			font: 'bold 20px Prompt',
			offsetY: -20,
			overflow: true,
			fill: new Fill({ color: 'rgba(0, 0, 0, 1)' }),
			stroke: new Stroke({
				color: 'rgba(255, 255, 255, 1)',
				width: 5,
			}),
		}),
	}),
});

export const routeStyleFunction = (feature: any) => {
	// console.log('1', feature.getGeometry().getType())
	return routeStyles(feature)[feature.getGeometry().getType() as keyof typeof routeStyles];
};

export const railStyleFunction = (feature: any) => {
	// console.log('1', feature.getGeometry().getType())
	return railStyles(feature)[feature.getGeometry().getType() as keyof typeof railStyles];
};

export const radians = (degrees: number) => {
	return degrees * Math.PI / 180;
};

export const getTranslate = (angle: number, distance: number) => {
	const rad = radians(angle % 360);
  
	return [distance * Math.sin(rad), distance * Math.cos(rad)];
}
