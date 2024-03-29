import dayjs from "dayjs";
import * as olGeom from 'ol/geom'
import * as polyline from '@mapbox/polyline';
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import {clamp} from "ramda";
import {ITripSection, SectionType} from "@transportmap/types";

dayjs.extend(utc);
dayjs.extend(timezone);

export const getNextStop = (sections: ITripSection[]): ITripSection | undefined => {
	const currentTime = dayjs().format('HH:mm:ss');
	return sections.find(
		(section) => currentTime <= (section.realtimeEndTime || section.endTime) && section.type === SectionType.STOP,
	);
}

export const getVehicleProgress = (sections: ITripSection[]): number => {
	const currentTime = dayjs().format('HH:mm:ss');
    const activeSection = sections.find(
        (calculation) => (calculation.realtimeStartTime || calculation.startTime) <= currentTime && currentTime <= (calculation.realtimeEndTime || calculation.endTime),
    );

    if (!activeSection) {
        return 0;
    }

    if (activeSection.type === SectionType.STOP) {
        return 0
    }

    return (dayjs().valueOf() - dayjs(`${dayjs().format('YYYY/MM/DD')} ${activeSection.realtimeStartTime || activeSection.startTime}`).valueOf()) /
        (dayjs(`${dayjs().format('YYYY/MM/DD')} ${activeSection.realtimeEndTime || activeSection.endTime}`).valueOf() -
            dayjs(`${dayjs().format('YYYY/MM/DD')} ${activeSection.realtimeStartTime || activeSection.startTime}`).valueOf());
}

export const getVehicleLocation = (sections: ITripSection[]): [number, number] | null => {
    const currentTime = dayjs().format('HH:mm:ss');
    const activeSection = sections.find(
        (calculation) => (calculation.realtimeStartTime || calculation.startTime) <= currentTime && currentTime <= (calculation.realtimeEndTime || calculation.endTime),
    );

    if (!activeSection) {
        return null;
    }

    if (activeSection.type === SectionType.STOP) {
        return [activeSection.startLocation.longitude, activeSection.startLocation.latitude]
    }

    const sectionProgress = getVehicleProgress(sections);
    const lineString = new olGeom.LineString(polyline.decode(activeSection.polyline!));
    const sectionLocation = lineString.getCoordinateAt(clamp(0, 1, sectionProgress));

    return [sectionLocation[1], sectionLocation[0]]
}
