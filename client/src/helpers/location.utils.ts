import dayjs from "dayjs";
import { OSRMLeg, Section } from "../store/vehicles/trips.types";
import * as olGeom from 'ol/geom'

export const getVehicleLocation = (sections: Section[], osrmRoute: OSRMLeg[]): [number, number] | null => {
    const currentTime = dayjs().format('HH:mm:ss');
    const activeSection = sections.find(
        (calculation) => calculation.startTime <= currentTime && currentTime <= calculation.endTime,
    );

    if (!activeSection) {
        return null;
    }

    if (activeSection.index === -1) {
        return [activeSection.startLocation.longitude, activeSection.startLocation.latitude]
    }

    const sectionProgress =
        (dayjs().valueOf() - dayjs(`${dayjs().format('YYYY/MM/DD')} ${activeSection.startTime}`).valueOf()) /
        (dayjs(`${dayjs().format('YYYY/MM/DD')} ${activeSection.endTime}`).valueOf() -
            dayjs(`${dayjs().format('YYYY/MM/DD')} ${activeSection.startTime}`).valueOf());

    // Grab index
    const activeGeometry = osrmRoute[activeSection.index];

    const sectionCoordinates = activeGeometry.steps.reduce(
        (acc, step) => [...acc, ...step.geometry.coordinates],
        [] as number[][],
    );

    const lineString = new olGeom.LineString(sectionCoordinates);
    const sectionLocation = lineString.getCoordinateAt(sectionProgress);

    return [sectionLocation[0], sectionLocation[1]]
}