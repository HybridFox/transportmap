import { StopTime, Trip } from 'core/entities';
import * as dayjs from 'dayjs';
import { getDistance, getRhumbLineBearing, getSpeed } from 'geolib';
import { omit, pick } from 'ramda';
import { redis } from '../../../modules/core/instances/redis.instance';
import got from 'got/dist/source';
import { createHash } from 'crypto';
import * as polyline from '@mapbox/polyline';

// TODO: clean this up
export interface Section {
	type: string;
	startTime: string;
	endTime: string;
	realtimeStartTime: string | null;
	realtimeEndTime: string | null;
	startLocation: { longitude: number; latitude: number };
	endLocation: { longitude: number; latitude: number };
	distance: number;
	activeGeometry: number[][];
	bearing: number;
	speed: number;
	index: number;
}

const clamp = (number: number, min: number, max: number) => Math.max(min, Math.min(number, max));

export const calculateTripPositions = async (trip: Trip, LineString: any): Promise<any> => {
	const currentTime = dayjs().format('HH:mm:ss');
	const sortedStopTimes: StopTime[] = trip.stopTimes.sort((a: any, b: any) => a.stopSequence - b.stopSequence);
	const firstDepartureTime = sortedStopTimes[0].departureTime;
	const lastDepartureTime = sortedStopTimes[sortedStopTimes.length - 1].arrivalTime;

	if (firstDepartureTime > currentTime || currentTime > lastDepartureTime) {
		return null;
	}

	// Push all the stopTimes into an array with their "between" sections (type = travel)
	const sections: Section[] = sortedStopTimes.reduce((acc, currentStopTime, i) => {
		const nextStopTime: StopTime = sortedStopTimes[i + 1];

		return [
			...acc,
			// Standing still in the station
			{
				type: 'station',
				startTime: currentStopTime.arrivalTime,
				endTime: currentStopTime.departureTime,
				realtimeStartTime: currentStopTime.realtimeArrivalTime,
				realtimeEndTime: currentStopTime.realtimeDepartureTime,
				startLocation: pick(['latitude', 'longitude'])(currentStopTime.stop),
				endLocation: pick(['latitude', 'longitude'])(currentStopTime.stop),
				distance: 0,
				bearing: 0,
				speed: 0,
				index: -1,
			},
			...(nextStopTime
				? [
						{
							index: i,
							type: 'travel',
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
				  ]
				: []),
		];
	}, []);

	const osrmRoute = await getOsrmRoute(sortedStopTimes.map((stopTime) => `${stopTime.stop.longitude},${stopTime.stop.latitude}`).join(';')).catch(
		console.error,
	);

	// Now that we have all the section, find the section we are currently in by the current time.
	const activeSection = sections.find((calculation) => calculation.startTime <= currentTime && currentTime <= calculation.endTime);

	if (activeSection.index === -1) {
		return {
			...omit(['calendar', 'calendarDates'])(trip),
			firstDepartureTime,
			lastDepartureTime,
			sectionLocation: {
				latitude: activeSection.startLocation.latitude,
				longitude: activeSection.startLocation.longitude,
			},
			sectionCoordinates: [[activeSection.startLocation.longitude, activeSection.startLocation.latitude]],
			sectionProgress: 0,
			bearing: activeSection.bearing,
			speed: activeSection.speed,
			stopTimes: sortedStopTimes,
			sections,
			osrmRoute,
		};
	}

	// TODO: what if this transitions thru midnight?
	const sectionProgress =
		(dayjs().unix() - dayjs(`${dayjs().format('YYYY/MM/DD')} ${activeSection.startTime}`).unix()) /
		(dayjs(`${dayjs().format('YYYY/MM/DD')} ${activeSection.endTime}`).unix() -
			dayjs(`${dayjs().format('YYYY/MM/DD')} ${activeSection.startTime}`).unix());

	// Grab index
	const activePolyline = osrmRoute[activeSection.index];

	// const sectionLocation = interpolatePoint(
	// 	sectionCoordinates,
	// 	0,
	// 	sectionCoordinates.length,
	// 	2,
	// 	clamp(sectionProgress, 0, 1),
	// 	null,
	// 	2,
	// );
	const lineString = new LineString(polyline.decode(activePolyline));
	const sectionLocation = lineString.getCoordinateAt(clamp(sectionProgress, 0, 1));

	if (!Array.isArray(sectionLocation)) {
		return null;
	}

	return {
		...omit(['calendar', 'calendarDates'])(trip),
		firstDepartureTime,
		lastDepartureTime,
		sectionLocation: {
			longitude: sectionLocation[1],
			latitude: sectionLocation[0],
		},
		sectionProgress,
		bearing: activeSection.bearing,
		speed: activeSection.speed,
		stopTimes: sortedStopTimes,
		sections,
		osrmRoute,
	};
};

const getOsrmRoute = async (coordinates: string): Promise<string[]> => {
	const key = createHash('sha256').update(coordinates).digest('hex');
	const cachedTripRoute = await redis.get(`TRIPSECTIONCOORDINATES:${key}`);

	if (cachedTripRoute) {
		return JSON.parse(cachedTripRoute);
	}

	// Grab the steps
	const osrmRoute: any = await got
		.get(`${process.env.OSRM_URL}/match/v1/train/${coordinates}`, {
			searchParams: {
				steps: true,
				// generate_hints: false,
				// geometries: 'geojson',
				// continue_straight: true,
				radiuses: coordinates
					.split(';')
					.map(() => 100)
					.join(';'),
				timestamps: coordinates
					.split(';')
					.map((_, i) => i * 3600)
					.join(';'),
			},
			resolveBodyOnly: true,
			responseType: 'json',
		})
		.catch((e) => console.error(e.response));

	// console.log(osrmRoute);

	// TODO: check if [0] is correct here on the steps
	const sectionCoordinates: string[] = osrmRoute.matchings[0].legs.reduce(
		(acc, leg) => (leg?.steps?.[0]?.geometry ? [...acc, leg?.steps?.[0]?.geometry] : acc),
		[],
	);
	console.log('!!! sectionCoordinates !!!', sectionCoordinates);

	redis.set(`TRIPSECTIONCOORDINATES:${key}`, JSON.stringify(sectionCoordinates));
	redis.expire(`TRIPSECTIONCOORDINATES:${key}`, 60 * 60 * 24 * 7);

	return sectionCoordinates;
};
