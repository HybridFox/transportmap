import * as olStyle from 'ol/style';
import {IStop} from "@transportmap/types";
import {getTranslation} from "./translation.util";
import {i18n} from "i18next";

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
		scale: 0.75,
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
		offsetY: -16,
		textAlign: "left",
		// opacity: state === STOP_MARKER_STATE.SUPPRESSED ? 0.5 : 1,
	}),
	zIndex,
});


export const getStopMarkerStyle = (stop: IStop, zIndex = 0, state: STOP_MARKER_STATE = STOP_MARKER_STATE.DEFAULT, locale: string): olStyle.Style[] => {
	return [MAIN_ICON_STYLE(stop, zIndex, state, locale)]
}
