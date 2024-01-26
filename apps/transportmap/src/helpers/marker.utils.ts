import * as olStyle from 'ol/style';
import {ICalculatedTrip} from "@transportmap/types";
import {getNextStop} from "./location.utils";
import dayjs from "dayjs";

export enum TRIP_MARKER_STATE {
	DEFAULT,
	SUPPRESSED,
	HIGHLIGHTED
}

const defaultIconProps: any = {
	anchor: [0.1, 46],
	anchorXUnits: 'fraction',
	anchorYUnits: 'pixels',
	size: [200, 50],
	scale: 0.75,
};

const highlightIconProps: any = {
	anchor: [0.1, 46],
	anchorXUnits: 'fraction',
	anchorYUnits: 'pixels',
	size: [200, 50],
};

const defaultTextProps = {
	font: 'bold 12px Prompt',
	fill: new olStyle.Fill({
		color: "#fff"
	}),
	offsetX: 20,
	offsetY: -16,
};

const highlightTextProps = {
	font: 'bold 13px Prompt',
	fill: new olStyle.Fill({
		color: "#fff"
	}),
	offsetX: 50,
	offsetY: -20,
};

const HSLToRGB = (h: number, s: number, l: number) => {
	s /= 100;
	l /= 100;
	const k = (n: number) => (n + h / 30) % 12;
	const a = s * Math.min(l, 1 - l);
	const f = (n: number) =>
		l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
	return [255 * f(0), 255 * f(8), 255 * f(4)];
};


export const MAIN_ICON_STYLE = (trip: ICalculatedTrip, zIndex = 0, state: TRIP_MARKER_STATE): Record<string, olStyle.Style> => ({
	'train': new olStyle.Style({
		image: new olStyle.Icon({
			...(state === TRIP_MARKER_STATE.HIGHLIGHTED ? highlightIconProps : defaultIconProps),
			color: state === TRIP_MARKER_STATE.HIGHLIGHTED ? '#ffa515' : '#ffffff',
			src: state === TRIP_MARKER_STATE.HIGHLIGHTED ? '/assets/img/icons/popup-train.svg' : '/assets/img/icons/popup-empty.svg',
			opacity: state === TRIP_MARKER_STATE.SUPPRESSED ? 0.25 : 1,
		}),
		text: new olStyle.Text({
			...(state === TRIP_MARKER_STATE.HIGHLIGHTED ? highlightTextProps : defaultTextProps),
			text: `${trip.route.routeCode} ${trip.name}`,
		}),
		zIndex
	}),
});

export const DELAY_ICON_STYLES = (trip: ICalculatedTrip, zIndex = 0, delayPercentage = 0, state: TRIP_MARKER_STATE): olStyle.Style => {
	const hue = Number(((1 - delayPercentage) * 120).toString(10));
	const colour = HSLToRGB(hue, 100, 50)

	return new olStyle.Style({
		image: new olStyle.Circle({
			radius: state === TRIP_MARKER_STATE.HIGHLIGHTED ? 5 : 3,
			fill: new olStyle.Fill({
				color: `rgba(${colour[0]}, ${colour[1]}, ${colour[2]}, ${state === TRIP_MARKER_STATE.SUPPRESSED ? 0.25 : 1})`
			}),
			displacement: state === TRIP_MARKER_STATE.HIGHLIGHTED ? [90, 22] : [67, 17],
		}),
		zIndex: zIndex + 1,
	})
}


export const getTripMarkerStyle = (trip: ICalculatedTrip, zIndex = 0, state: TRIP_MARKER_STATE = TRIP_MARKER_STATE.DEFAULT): olStyle.Style[] => {
	const nextStop = getNextStop(trip.sections);
	const minutesDelay = dayjs(`${dayjs().tz('Europe/Brussels').format('DD/MM/YYYY')} ${nextStop?.realtimeEndTime || nextStop?.endTime}`, 'DD/MM/YYYY HH:mm:ss')
		.diff(dayjs(`${dayjs().tz('Europe/Brussels').format('DD/MM/YYYY')} ${nextStop?.endTime}`, 'DD/MM/YYYY HH:mm:ss'), 'minutes');

	return [MAIN_ICON_STYLE(trip, zIndex, state)['train'], DELAY_ICON_STYLES(trip, zIndex, Math.min(1, minutesDelay / 10), state)]
}
