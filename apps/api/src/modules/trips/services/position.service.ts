import dayjs from 'dayjs';
import { getDistance, getRhumbLineBearing, getSpeed } from 'geolib';
import { pick } from 'ramda';
import polyline from '@mapbox/polyline';
import { StopTime, Trip } from '@transportmap/database';
import LineString from 'ol/geom/LineString.js';
import { ICalculatedTrip, ITripSection, SectionType } from '@transportmap/types';
import { Injectable } from '@nestjs/common';

import { LoggingService } from '~core/services/logging.service';

import { OSRMService } from './osrm.service';

const clamp = (number: number, min: number, max: number) => Math.max(min, Math.min(number, max));

@Injectable()
export class PositionService {
	constructor(
		private readonly osrmService: OSRMService
	) { }

	public calculateTripPositions = async (trip: Trip, loggingService: LoggingService): Promise<ICalculatedTrip> => {
		const currentTime = dayjs().format('HH:mm:ss');
		const sortedStopTimes: StopTime[] = trip.stopTimes.sort((a: any, b: any) => a.stopSequence - b.stopSequence);
	
		if (!sortedStopTimes[0]) {
			return;
		}
	
		const firstDepartureTime = sortedStopTimes[0].departureTime;
		const lastDepartureTime = sortedStopTimes[sortedStopTimes.length - 1].arrivalTime;
	
		if (firstDepartureTime > currentTime || currentTime > lastDepartureTime) {
			return null;
		}
	
		const osrmRoute = await this.osrmService.getOsrmRoute(
			sortedStopTimes.map((stopTime) => `${stopTime.stop.longitude},${stopTime.stop.latitude}`, loggingService).join(';')
		);
	
		// Push all the stopTimes into an array with their "between" sections (type = travel)
		const sections: ITripSection[] = sortedStopTimes.reduce((acc, currentStopTime, i) => {
			const nextStopTime: StopTime = sortedStopTimes[i + 1];
			
			const stationSection: ITripSection = {
				type: SectionType.STOP,
				startTime: currentStopTime.arrivalTime,
				endTime: currentStopTime.departureTime,
				realtimeStartTime: currentStopTime.realtimeArrivalTime,
				realtimeEndTime: currentStopTime.realtimeDepartureTime,
				startLocation: pick(['latitude', 'longitude'])(currentStopTime.stop),
				endLocation: pick(['latitude', 'longitude'])(currentStopTime.stop),
				distance: 0,
				bearing: 0,
				speed: 0,
				stop: pick(['id', 'code', 'name', 'description', 'latitude', 'longitude', 'translations'])(currentStopTime.stop) as any,
			};
	
			if (!nextStopTime) {
				return [
					...acc,
					stationSection
				]
			}
	
			return [
				...acc,
				stationSection,
				{
					type: SectionType.TRAVEL,
					startTime: currentStopTime.departureTime,
					endTime: nextStopTime.arrivalTime,
					realtimeStartTime: currentStopTime.realtimeDepartureTime,
					realtimeEndTime: nextStopTime.realtimeArrivalTime,
					startLocation: pick(['latitude', 'longitude'])(currentStopTime.stop),
					endLocation: pick(['latitude', 'longitude'])(nextStopTime.stop),
					distance: getDistance(
						pick(['latitude', 'longitude'])(currentStopTime.stop),
						pick(['latitude', 'longitude'])(nextStopTime.stop),
					),
					bearing: getRhumbLineBearing(
						pick(['latitude', 'longitude'])(currentStopTime.stop),
						pick(['latitude', 'longitude'])(nextStopTime.stop),
					),
					polyline: this.getPolyline(osrmRoute, i, currentStopTime, nextStopTime),
					speed: getSpeed(
						{
							...pick(['latitude', 'longitude'])(currentStopTime.stop),
							time:
								dayjs(
									`${dayjs().format('YYYY/MM/DD')} ${
										currentStopTime.realtimeDepartureTime || currentStopTime.departureTime
									}`,
								).unix() * 1000,
						},
						{
							...pick(['latitude', 'longitude'])(nextStopTime.stop),
							time:
								dayjs(
									`${dayjs().format('YYYY/MM/DD')} ${nextStopTime.realtimeArrivalTime || nextStopTime.arrivalTime}`,
								).unix() * 1000,
						},
					),
				},
			];
		}, []);
	
		// Now that we have all the section, find the section we are currently in by the current time.
		const activeSection = sections.find((calculation) => calculation.startTime <= currentTime && currentTime <= calculation.endTime);
	
		// If the active section is just a station stop, don't bother calculating the current location.
		if (activeSection.type === SectionType.STOP) {
			return {
				...pick(['id', 'name', 'route'])(trip),
				headSign: trip.headsign,
				sectionLocation: {
					latitude: activeSection.startLocation.latitude,
					longitude: activeSection.startLocation.longitude,
				},
				sectionProgress: 0,
				bearing: activeSection.bearing,
				speed: activeSection.speed,
				sections,
			};
		}
	
		// TODO: what if this transitions thru midnight?
		const sectionProgress =
			(dayjs().unix() - dayjs(`${dayjs().format('YYYY/MM/DD')} ${activeSection.startTime}`).unix()) /
			(dayjs(`${dayjs().format('YYYY/MM/DD')} ${activeSection.endTime}`).unix() -
				dayjs(`${dayjs().format('YYYY/MM/DD')} ${activeSection.startTime}`).unix());
	
		const lineString = new LineString(polyline.decode(activeSection.polyline));
		const sectionLocation = lineString.getCoordinateAt(clamp(sectionProgress, 0, 1));
	
		if (!Array.isArray(sectionLocation)) {
			return null;
		}
	
		return {
			...pick(['id', 'name', 'route'])(trip),
			headSign: trip.headsign,
			sectionLocation: {
				longitude: sectionLocation[1],
				latitude: sectionLocation[0],
			},
			sectionProgress,
			bearing: activeSection.bearing,
			speed: activeSection.speed,
			sections,
		};
	};

	private getPolyline(polylines: string[], index: number, currentStopTime: StopTime, nextStopTime: StopTime): string {
		if (polylines[index]) {
			return polylines[index];
		}

		return polyline.encode([
			[currentStopTime.stop.latitude, currentStopTime.stop.longitude],
			[nextStopTime.stop.latitude, nextStopTime.stop.longitude],
		])
	}
}
