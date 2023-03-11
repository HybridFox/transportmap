import * as olStyle from 'ol/style';

const defaultIconProps = {
	anchor: [0.5, 46],
	anchorXUnits: 'fraction',
	anchorYUnits: 'pixels',
	size: [50, 50],
};

const defaultGhostProps = {
	...defaultIconProps,
	opacity: 0.3,
};

export const MAP_ICON_STYLES = (): Record<string, Record<string, olStyle.Style>> => ({
	normal: {
		bus: new olStyle.Style({
			image: new olStyle.Icon({
				...defaultIconProps,
				color: '#FFC312',
				src: '/assets/img/icons/popup-bus.svg',
			}),
		}),
		'local-train': new olStyle.Style({
			image: new olStyle.Icon({
				...defaultIconProps,
				color: '#12CBC4',
				src: '/assets/img/icons/popup-train.svg',
			}),
		}),
		'intercity-p': new olStyle.Style({
			image: new olStyle.Icon({
				...defaultIconProps,
				color: '#12CBC4',
				src: '/assets/img/icons/popup-train.svg',
			}),
		}),
		's-train': new olStyle.Style({
			image: new olStyle.Icon({
				...defaultIconProps,
				color: '#12CBC4',
				src: '/assets/img/icons/popup-train.svg',
			}),
		}),
		metro: new olStyle.Style({
			image: new olStyle.Icon({
				...defaultIconProps,
				color: '#ED4C67',
				src: '/assets/img/icons/popup-metro.svg',
			}),
		}),
		tram: new olStyle.Style({
			image: new olStyle.Icon({
				...defaultIconProps,
				color: '#ED4C67',
				src: '/assets/img/icons/popup-metro.svg',
			}),
		}),
	},
	ghost: {
		bus: new olStyle.Style({
			image: new olStyle.Icon({
				...defaultIconProps,
				...defaultGhostProps,
				color: '#FFC312',
				src: '/assets/img/icons/popup-bus.svg',
			}),
		}),
		'local-train': new olStyle.Style({
			image: new olStyle.Icon({
				...defaultIconProps,
				...defaultGhostProps,
				color: '#12CBC4',
				src: '/assets/img/icons/popup-train.svg',
			}),
		}),
		'intercity-p': new olStyle.Style({
			image: new olStyle.Icon({
				...defaultIconProps,
				...defaultGhostProps,
				color: '#12CBC4',
				src: '/assets/img/icons/popup-train.svg',
			}),
		}),
		's-train': new olStyle.Style({
			image: new olStyle.Icon({
				...defaultIconProps,
				...defaultGhostProps,
				color: '#12CBC4',
				src: '/assets/img/icons/popup-train.svg',
			}),
		}),
		metro: new olStyle.Style({
			image: new olStyle.Icon({
				...defaultIconProps,
				...defaultGhostProps,
				color: '#ED4C67',
				src: '/assets/img/icons/popup-metro.svg',
			}),
		}),
		tram: new olStyle.Style({
			image: new olStyle.Icon({
				...defaultIconProps,
				...defaultGhostProps,
				color: '#ED4C67',
				src: '/assets/img/icons/popup-metro.svg',
			}),
		}),
	},
});
