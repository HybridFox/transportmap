import { Injectable } from '@nestjs/common';
import PathFinder from 'geojson-path-finder';
import * as NodeCache from 'node-cache';
import { gotInstance } from '../helpers/got';
import * as fs from 'fs/promises';
import * as path from 'path';
import { tokenRepository } from '../helpers/tokenRepository';
import { StopTime } from 'core/entities';
import { distToSegment, projectToLine } from '../helpers/map-helpers';

@Injectable()
export class GeoService {
	private nodeCache: NodeCache;
	private lineSections: any;
	private pathFinder: PathFinder<unknown, unknown>;

	constructor() {
		// (async () => {
		// 	this.lineSections = JSON.parse(
		// 		await fs.readFile(
		// 			path.join(__dirname, '../../../../../src/modules/trips/static/station_to_station.geojson'),
		// 			'utf-8',
		// 		),
		// 	);
		// 	this.pathFinder = new PathFinder(this.lineSections);
		// })();
	}

	public projectLocation(latitude: number, longitude: number, coordinates: number[][]): any {
		let shortestStartSegment = {
			distance: 999,
			segment: [],
		};

		for (let lineSectionIndex = 0; lineSectionIndex < this.lineSections.features.length; lineSectionIndex++) {
			const lineSection = this.lineSections.features[lineSectionIndex];

			for (let index = 0; index < lineSection.geometry.coordinates.length - 1; index++) {
				const firstCoordinate = lineSection.geometry.coordinates[index];
				const secondCoordinate = lineSection.geometry.coordinates[index + 1];

				const distance = distToSegment(
					{
						x: latitude,
						y: longitude,
					},
					{
						x: firstCoordinate[1],
						y: firstCoordinate[0],
					},
					{
						x: secondCoordinate[1],
						y: secondCoordinate[0],
					},
				);

				if (distance < shortestStartSegment.distance) {
					shortestStartSegment = {
						distance: distance,
						segment: [firstCoordinate, secondCoordinate],
					};
				}
			}
		}

		const projection = projectToLine(
			{
				x: latitude,
				y: longitude,
			},
			{
				x: shortestStartSegment.segment[0][1],
				y: shortestStartSegment.segment[0][0],
			},
			{
				x: shortestStartSegment.segment[1][1],
				y: shortestStartSegment.segment[1][0],
			},
		);

		return {
			latitude: projection.point.x,
			longitude: projection.point.y,
		};
	}

	// public async getPreciseRoute(stopTimes: StopTime[]): Promise<any> {
	// 	// console.log(stopTimes);
	// 	return stopTimes.reduce((acc: unknown[], currentStopTime, i) => {
	// 		if (typeof stopTimes[i + 1] === 'undefined') {
	// 			return acc;
	// 		}

	// 		const nextStopTime = stopTimes[i + 1];

	// 		const startLocation = this.projectLocation(currentStopTime.stop.latitude, currentStopTime.stop.longitude);
	// 		const endLocation = this.projectLocation(nextStopTime.stop.latitude, nextStopTime.stop.longitude);

	// 		const travelInfo = this.pathFinder.findPath(
	// 			{
	// 				type: 'Feature',
	// 				geometry: {
	// 					type: 'Point',
	// 					coordinates: [startLocation.latitude, startLocation.longitude],
	// 				},
	// 				properties: {},
	// 			},
	// 			{
	// 				type: 'Feature',
	// 				geometry: {
	// 					type: 'Point',
	// 					coordinates: [endLocation.latitude, endLocation.longitude],
	// 				},
	// 				properties: {},
	// 			},
	// 		);

	// 		if (!travelInfo) {
	// 			return acc;
	// 		}

	// 		return [...acc, ...travelInfo.path];
	// 	}, []);
	// }
}
