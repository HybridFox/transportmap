import dayjs from "dayjs";
import { OSRMLeg, Section } from "../store/vehicles/trips.types";
import * as olGeom from 'ol/geom'
import * as polyline from '@mapbox/polyline';

export const getVehicleLocation = (sections: Section[], osrmRoute: string[]): [number, number] | null => {
    const currentTime = dayjs().format('HH:mm:ss');
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
        (dayjs().valueOf() - dayjs(`${dayjs().format('YYYY/MM/DD')} ${activeSection.realtimeStartTime || activeSection.startTime}`).valueOf()) /
        (dayjs(`${dayjs().format('YYYY/MM/DD')} ${activeSection.realtimeEndTime || activeSection.endTime}`).valueOf() -
            dayjs(`${dayjs().format('YYYY/MM/DD')} ${activeSection.realtimeStartTime || activeSection.startTime}`).valueOf());

    // Grab index
    const activePolyline = osrmRoute[activeSection.index];
    const lineString = new olGeom.LineString(polyline.decode(activePolyline));
    const sectionLocation = lineString.getCoordinateAt(sectionProgress);

    return [sectionLocation[1], sectionLocation[0]]
}