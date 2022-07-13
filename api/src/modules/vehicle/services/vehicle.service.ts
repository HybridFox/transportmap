import * as fs from 'fs/promises';
import * as path from 'path';

import { Injectable } from '@nestjs/common';
import { Command } from 'nestjs-command';
import * as hafas from 'hafas-client';
import * as dbProfile from 'hafas-client/p/sncb';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { unnest } from 'ramda';
import * as PathFinder from 'geojson-path-finder';
import got from 'got';

import { TRAIN_PRODUCTS } from '../vehicle.const';
import { distToSegment, projectToLine, splitBoundingBox } from '../helpers/mapHelpers';
import { BoundingBox } from '../helpers/mapHelpers.types';

import { Vehicle, VehicleDocument } from '~schemas/vehicle.schema';

@Injectable()
export class VehicleService {
	private client: hafas.HafasClient;
	private pathFinder: any;
	private lineSections: any;

	constructor(@InjectModel(Vehicle.name) private vehicleModel: Model<VehicleDocument>) {
		void (async () => {
			this.lineSections = JSON.parse(
				await fs.readFile(path.join(__dirname, '../static/lijnsecties.geojson'), 'utf-8'),
			);
			this.pathFinder = new PathFinder(this.lineSections, { precision: 0.01 });
		})();

		this.client = hafas(dbProfile, 'uwu owo uwu');
	}

	// @Cron('* * * * *')
	@Command({
		command: 'sync:vehicles',
		describe: 'Sync vehicles',
	})
	async syncVehicles(): Promise<void> {
		const boxes = splitBoundingBox({
			north: 51.5976956714,
			west: 2.3672193567,
			south: 49.3158513803,
			east: 6.702311577,
		});

		const items = await Promise.all(
			boxes.map(({ ...coords }) => this.client.radar(coords, { results: 20, polylines: false })),
		);

		await this.vehicleModel.deleteMany({}).exec();

		try {
			await Promise.allSettled(
				unnest(items).map(async (item) => {
					if (!TRAIN_PRODUCTS.includes(item.line.product)) {
						return this.vehicleModel.create({
							...item,
							lineId: item.line.id,
							projectedLocation: {
								latitude: item.location.latitude,
								longitude: item.location.longitude,
							},
						});
					}

					const trip = await this.client.trip(item.tripId, item.line.name, {
						polyline: true,
						language: 'nl',
					});

					const routeDetail = trip.stopovers.reduce((acc: unknown[], currentStopOver, i) => {
						if (typeof trip.stopovers[i + 1] === 'undefined') {
							return acc;
						}

						const nextStopOver = trip.stopovers[i + 1];

						const travelInfo = this.pathFinder.findPath(
							{
								type: 'Feature',
								geometry: {
									type: 'Point',
									coordinates: [
										currentStopOver.stop.location.longitude,
										currentStopOver.stop.location.latitude,
									],
								},
							},
							{
								type: 'Feature',
								geometry: {
									type: 'Point',
									coordinates: [
										nextStopOver.stop.location.longitude,
										nextStopOver.stop.location.latitude,
									],
								},
							},
						);

						if (!travelInfo) {
							return acc;
						}

						return [...acc, ...travelInfo.path];
					}, []);

					let shortestSegment = {
						distance: 999,
						segment: [],
					};

					for (
						let lineSectionIndex = 0;
						lineSectionIndex < this.lineSections.features.length;
						lineSectionIndex++
					) {
						const lineSection = this.lineSections.features[lineSectionIndex];

						for (let index = 0; index < lineSection.geometry.coordinates.length - 1; index++) {
							const firstCoordinate = lineSection.geometry.coordinates[index];
							const secondCoordinate = lineSection.geometry.coordinates[index + 1];

							const distance = distToSegment(
								{
									x: item.location.latitude,
									y: item.location.longitude,
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

							if (distance < shortestSegment.distance) {
								shortestSegment = {
									distance: distance,
									segment: [firstCoordinate, secondCoordinate],
								};
							}
						}
					}

					const projection = projectToLine(
						{
							x: item.location.latitude,
							y: item.location.longitude,
						},
						{
							x: shortestSegment.segment[0][1],
							y: shortestSegment.segment[0][0],
						},
						{
							x: shortestSegment.segment[1][1],
							y: shortestSegment.segment[1][0],
						},
					);

					await this.vehicleModel.create({
						...item,
						lineId: item.line.id,
						lineGeo: {
							type: 'FeatureCollection',
							features: [
								{
									type: 'Feature',
									geometry: {
										type: 'LineString',
										coordinates: routeDetail,
									},
								},
								...trip.stopovers.map((stopover) => ({
									type: 'Feature',
									geometry: {
										type: 'Point',
										coordinates: [
											stopover.stop.location.longitude,
											stopover.stop.location.latitude,
										],
									},
									properties: {
										name: stopover.stop.name,
									},
								})),
							],
						},
						projectedLocation: {
							latitude: projection.point.x,
							longitude: projection.point.y,
						},
					});
				}),
			);
		} catch (e) {
			console.error(e);
		}
	}

	public async getAll({ north, south, west, east }: BoundingBox): Promise<VehicleDocument[]> {
		return this.vehicleModel.find({
			$and: [
				{
					'location.latitude': {
						$gte: south,
						$lte: north,
					},
				},
				{
					'location.longitude': {
						$gte: west,
						$lte: east,
					},
				},
				{
					'line.product': {
						$in: TRAIN_PRODUCTS,
					},
				},
			],
		});
	}

	public async getOne(lineId: string): Promise<any> {
		const vehicle = await this.vehicleModel.findOne({ 'line.id': lineId }).lean();
		const trip = await this.client.trip(vehicle.tripId, vehicle.line.name, {
			polyline: true,
			language: 'nl',
		});

		const composition = await got.get(
			`https://trainmap.belgiantrain.be/data/composition/${
				vehicle.lineId.split('-')[vehicle.lineId.split('-').length - 1]
			}`,
			{
				resolveBodyOnly: true,
				responseType: 'json',
			},
		);

		return {
			...vehicle,
			composition,
			trip,
		};
	}
}
