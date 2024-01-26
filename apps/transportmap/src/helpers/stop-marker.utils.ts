import * as olStyle from 'ol/style';
import {IStop} from "@transportmap/types";
import {getTranslation} from "./translation.util";
import {i18n} from "i18next";
import {getNextStop} from "./location.utils";
import dayjs from "dayjs";

export enum STOP_MARKER_STATE {
	DEFAULT,
	SUPPRESSED,
	HIGHLIGHTED
}

export const MAIN_ICON_STYLE = (stop: IStop, zIndex = 0, state: STOP_MARKER_STATE, locale: string): olStyle.Style => new olStyle.Style({
	image: new olStyle.Icon({
		anchor: [0.1, 46],
		anchorXUnits: 'fraction',
		anchorYUnits: 'pixels',
		size: [250, 50],
		scale: 0.65,
		src: '/assets/img/icons/popup-wide.svg',
		opacity: state === STOP_MARKER_STATE.SUPPRESSED ? 0.25 : 1,
	}),
	text: new olStyle.Text({
		text: `${getTranslation(stop?.translations, locale) || stop.name}`,
		font: 'bold 12px Prompt',
		fill: new olStyle.Fill({
			color: state === STOP_MARKER_STATE.SUPPRESSED ? "#50505011" :"#505050",
		}),
		offsetX: -10,
		offsetY: -13,
		textAlign: "left",
		// opacity: state === STOP_MARKER_STATE.SUPPRESSED ? 0.5 : 1,
	}),
	zIndex,
});

const DELAY_STYLE = (zIndex = 0, state: STOP_MARKER_STATE, delay: number): olStyle.Style => new olStyle.Style({
	text: new olStyle.Text({
		text: `+${delay}'`,
		font: 'bold 12px Prompt',
		fill: new olStyle.Fill({
			color: state === STOP_MARKER_STATE.SUPPRESSED ? "#FFAA2B11" :"#FFAA2B",
		}),
		offsetX: 135,
		offsetY: -13,
		textAlign: "right",
		// opacity: state === STOP_MARKER_STATE.SUPPRESSED ? 0.5 : 1,
	}),
	zIndex,
});


export const getStopMarkerStyle = (stop: any, zIndex = 0, state: STOP_MARKER_STATE = STOP_MARKER_STATE.DEFAULT, locale: string, minutesDelay?: number): olStyle.Style[] => {
	return [MAIN_ICON_STYLE(stop, zIndex, state, locale), ...(minutesDelay ? [DELAY_STYLE(zIndex, state, minutesDelay)] : [])]
}
