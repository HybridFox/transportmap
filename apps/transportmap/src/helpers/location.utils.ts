import dayjs from "dayjs";
import { OSRMLeg, Section } from "../store/trips/trips.types";
import * as olGeom from 'ol/geom'
import * as polyline from '@mapbox/polyline';
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { clamp } from "ramda";

dayjs.extend(utc)
dayjs.extend(timezone)

export const getVehicleLocation = (sections: Section[], osrmRoute: string[]): [number, number] | null => {
    const currentTime = dayjs().tz('Europe/Brussels').format('HH:mm:ss');
    const activeSection = sections.find(
        (calculation) => (calculation.realtimeStartTime || calculation.startTime) <= currentTime && currentTime <= (calculation.realtimeEndTime || calculation.endTime),
    );

    if (!activeSection) {
        return null;
    }

    if (activeSection.index === -1) {
        return [activeSection.startLocation.longitude, activeSection.startLocation.latitude]
    }

    const sectionProgress =
        (dayjs().tz('Europe/Brussels').valueOf() - dayjs(`${dayjs().tz('Europe/Brussels').format('YYYY/MM/DD')} ${activeSection.realtimeStartTime || activeSection.startTime}`).valueOf()) /
        (dayjs(`${dayjs().tz('Europe/Brussels').format('YYYY/MM/DD')} ${activeSection.realtimeEndTime || activeSection.endTime}`).valueOf() -
            dayjs(`${dayjs().tz('Europe/Brussels').format('YYYY/MM/DD')} ${activeSection.realtimeStartTime || activeSection.startTime}`).valueOf());

    // Grab index
    const activePolyline = osrmRoute[activeSection.index];

    if (!activePolyline) {
        return [activeSection.startLocation.longitude, activeSection.startLocation.latitude]
    }
    
    const lineString = new olGeom.LineString(polyline.decode(activePolyline));
    const sectionLocation = lineString.getCoordinateAt(clamp(0, 1, sectionProgress));

    return [sectionLocation[1], sectionLocation[0]]
}