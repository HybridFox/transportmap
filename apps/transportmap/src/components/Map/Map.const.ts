import * as olStyle from 'ol/style';
import {ICalculatedTrip} from "@transportmap/types";

const defaultIconProps: any = {
	anchor: [0.1, 46],
	anchorXUnits: 'fraction',
	anchorYUnits: 'pixels',
	size: [200, 50],
};

const defaultTextProps = {
	font: 'bold 15px Prompt',
	fill: new olStyle.Fill({
	  color: "#fff"
	}),
	offsetX: 55,
	offsetY: -20,
};

export const MAP_ICON_STYLES = (trip: ICalculatedTrip, zIndex = 0): Record<string, Record<string, olStyle.Style>> => ({
	normal: {
		BUS: new olStyle.Style({
			image: new olStyle.Icon({
				...defaultIconProps,
				color: '#FFC312',
				src: '/assets/img/icons/popup-bus.svg',
			}),
			zIndex
		}),
		'L': new olStyle.Style({
			image: new olStyle.Icon({
				...defaultIconProps,
				color: '#ffa515',
				src: '/assets/img/icons/popup-train.svg',
			}),
			text: new olStyle.Text({
				...defaultTextProps,
				text: `${trip.route.routeCode} ${trip.name}`,
			}),
			zIndex
		}),
		'IC': new olStyle.Style({
			image: new olStyle.Icon({
				...defaultIconProps,
				color: '#ffa515',
				src: '/assets/img/icons/popup-train.svg',
			}),
			text: new olStyle.Text({
				...defaultTextProps,
				text: `${trip.route.routeCode} ${trip.name}`
			}),
			zIndex
		}),
		'EXP': new olStyle.Style({
			image: new olStyle.Icon({
				...defaultIconProps,
				color: '#ff1515',
				src: '/assets/img/icons/popup-train.svg',
			}),
			text: new olStyle.Text({
				...defaultTextProps,
				text: `${trip.route.routeCode} ${trip.name}`
			}),
			zIndex
		}),
		'S': new olStyle.Style({
			image: new olStyle.Icon({
				...defaultIconProps,
				color: '#ffa515',
				src: '/assets/img/icons/popup-train.svg',
			}),
			text: new olStyle.Text({
				...defaultTextProps,
				text: `${trip.route.routeCode} ${trip.name}`
			}),
			zIndex
		}),
		'P': new olStyle.Style({
			image: new olStyle.Icon({
				...defaultIconProps,
				color: '#ffa515',
				src: '/assets/img/icons/popup-train.svg',
			}),
			text: new olStyle.Text({
				...defaultTextProps,
				text: `${trip.route.routeCode} ${trip.name}`
			}),
			zIndex
		}),
		METRO: new olStyle.Style({
			image: new olStyle.Icon({
				...defaultIconProps,
				color: '#ED4C67',
				src: '/assets/img/icons/popup-metro.svg',
			}),
			zIndex
		}),
		TRAM: new olStyle.Style({
			image: new olStyle.Icon({
				...defaultIconProps,
				color: '#ED4C67',
				src: '/assets/img/icons/popup-metro.svg',
			}),
			zIndex
		}),
	}
});
