import * as olStyle from 'ol/style';

import { Trip } from '../../store/trips/trips.types';

const defaultIconProps: any = {
	anchor: [0.13, 46],
	anchorXUnits: 'fraction',
	anchorYUnits: 'pixels',
	size: [200, 50],
};

const defaultTextProps = {
	font: 'bold 15px Prompt',
	fill: new olStyle.Fill({
	  color: "#fff"
	}),
	offsetX: 50,
	offsetY: -20
};

export const MAP_ICON_STYLES = (trip: Trip): Record<string, Record<string, olStyle.Style>> => ({
	normal: {
		BUS: new olStyle.Style({
			image: new olStyle.Icon({
				...defaultIconProps,
				color: '#FFC312',
				src: '/assets/img/icons/popup-bus.svg',
			}),
		}),
		'L': new olStyle.Style({
			image: new olStyle.Icon({
				...defaultIconProps,
				color: '#12CBC4',
				src: '/assets/img/icons/popup-train.svg',
			}),
			text: new olStyle.Text({
				...defaultTextProps,
				text: `${trip.route.routeCode} ${trip.name}`,
			})
		}),
		'IC': new olStyle.Style({
			image: new olStyle.Icon({
				...defaultIconProps,
				color: '#12CBC4',
				src: '/assets/img/icons/popup-train.svg',
			}),
			text: new olStyle.Text({
				...defaultTextProps,
				text: `${trip.route.routeCode} ${trip.name}`
			})
		}),
		'S': new olStyle.Style({
			image: new olStyle.Icon({
				...defaultIconProps,
				color: '#12CBC4',
				src: '/assets/img/icons/popup-train.svg',
			}),
			text: new olStyle.Text({
				...defaultTextProps,
				text: `${trip.route.routeCode} ${trip.name}`
			})
		}),
		'P': new olStyle.Style({
			image: new olStyle.Icon({
				...defaultIconProps,
				color: '#12CBC4',
				src: '/assets/img/icons/popup-train.svg',
			}),
			text: new olStyle.Text({
				...defaultTextProps,
				text: `${trip.route.routeCode} ${trip.name}`
			})
		}),
		METRO: new olStyle.Style({
			image: new olStyle.Icon({
				...defaultIconProps,
				color: '#ED4C67',
				src: '/assets/img/icons/popup-metro.svg',
			}),
		}),
		TRAM: new olStyle.Style({
			image: new olStyle.Icon({
				...defaultIconProps,
				color: '#ED4C67',
				src: '/assets/img/icons/popup-metro.svg',
			}),
		}),
	}
});
