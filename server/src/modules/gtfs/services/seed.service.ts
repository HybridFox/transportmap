import { Inject, Injectable } from '@nestjs/common';
import { Command } from 'nestjs-command';
import { parse } from 'csv-parse';
import * as fs from 'fs';
import { Agency, Calendar, CalendarDate, Route, Stop, StopTime, Transfer, Translation, Trip } from 'core/entities';
import { Repository } from 'typeorm';
import { TABLE_PROVIDERS } from 'core/providers/table.providers';
import { randomUUID } from 'crypto';

type FileMap = Record<
	string,
	{
		repository: Repository<unknown>;
		columnMapping: Record<string, string>;
		requiresId?: boolean;
	}
>;

@Injectable()
export class SeedService {
	constructor(
		@Inject(TABLE_PROVIDERS.AGENCY_REPOSITORY) private agencyRepository: Repository<Agency>,
		@Inject(TABLE_PROVIDERS.CALENDAR_DATE_REPOSITORY) private calendarDateRepository: Repository<CalendarDate>,
		@Inject(TABLE_PROVIDERS.CALENDAR_REPOSITORY) private calendarRepository: Repository<Calendar>,
		@Inject(TABLE_PROVIDERS.ROUTE_REPOSITORY) private routeRepository: Repository<Route>,
		@Inject(TABLE_PROVIDERS.STOP_TIME_REPOSITORY) private stopTimeRepository: Repository<StopTime>,
		@Inject(TABLE_PROVIDERS.STOP_REPOSITORY) private stopRepository: Repository<Stop>,
		@Inject(TABLE_PROVIDERS.TRANSFER_REPOSITORY) private transferRepository: Repository<Transfer>,
		@Inject(TABLE_PROVIDERS.TRANSLATION_REPOSITORY) private translationRepository: Repository<Translation>,
		@Inject(TABLE_PROVIDERS.TRIP_REPOSITORY) private tripRepository: Repository<Trip>,
	) {}

	public fileMap: FileMap = {
		stop_times: {
			repository: this.stopTimeRepository,
			columnMapping: {
				tripId: 'trip_id',
				arrivalTime: 'arrival_time',
				departureTime: 'departure_time',
				stopId: 'stop_id',
				stopSequence: 'stop_sequence',
				stopHeadsign: 'stop_headsign',
				pickupType: 'pickup_type',
				dropOffType: 'drop_off_type',
				shapeDistTraveled: 'shape_dist_traveled',
			},
		},
		trips: {
			repository: this.tripRepository,
			columnMapping: {
				id: 'trip_id',
				routeId: 'route_id',
				serviceId: 'service_id',
				headsign: 'trip_headsign',
				name: 'trip_short_name',
				directionId: 'direction_id',
				blockId: 'block_id',
				shapeId: 'shape_id',
				type: 'trip_type',
			},
		},
		routes: {
			repository: this.routeRepository,
			columnMapping: {
				id: 'route_id',
				agencyId: 'agency_id',
				routeCode: 'route_short_name',
				name: 'route_long_name',
				description: 'route_desc',
				type: 'route_type',
				url: 'route_url',
				color: 'route_color',
				textColor: 'route_text_color',
			},
		},
		agency: {
			repository: this.agencyRepository,
			columnMapping: {
				id: 'agency_id',
				name: 'agency_name',
				url: 'agency_url',
				timezone: 'agency_timezone',
				language: 'agency_lang',
				phoneNumber: 'agency_phone',
			},
		},
		calendar_dates: {
			repository: this.calendarDateRepository,
			requiresId: true,
			columnMapping: {
				serviceId: 'service_id',
				date: 'date',
				exceptionType: 'exception_type',
			},
		},
		calendar: {
			repository: this.calendarRepository,
			columnMapping: {
				serviceId: 'service_id',
				monday: 'monday',
				tuesday: 'tuesday',
				wednesday: 'wednesday',
				thursday: 'thursday',
				friday: 'friday',
				saturday: 'saturday',
				sunday: 'sunday',
				startDate: 'start_date',
				endDate: 'end_date',
			},
		},
		stops: {
			repository: this.stopRepository,
			columnMapping: {
				id: 'stop_id',
				code: 'stop_code',
				name: 'stop_name',
				description: 'stop_desc',
				latitude: 'stop_lat',
				longitude: 'stop_lon',
				zoneId: 'zone_id',
				url: 'stop_url',
				locationType: 'location_type',
				parent_station: 'parentStationId',
				platformCode: 'platform_code',
			},
		},
		// transfers: {
		// 	repository: this.transferRepository,
		// 	columnMapping: {
		// 		fromStopId: 'from_stop_id',
		// 		toStopId: 'to_stop_id',
		// 		transferType: 'transfer_type',
		// 		minTransferTime: 'min_transfer_time',
		// 		fromTripId: 'from_trip_id',
		// 		toTripId: 'to_trip_id',
		// 	},
		// },
		// translations: {
		// 	repository: this.translationRepository,
		// 	columnMapping: {
		// 		translationKey: 'trans_id',
		// 		language: 'lang',
		// 		translation: 'translation',
		// 	},
		// },
	};

	@Command({
		command: 'seed',
		describe: 'Sync vehicles',
	})
	public async seed() {
		Object.keys(this.fileMap).reduce(async (acc, fileName) => {
			await acc;
			await this.fileMap[fileName].repository.clear();

			const routeCsv = fs.readFileSync(`${__dirname}/../static/${fileName}.txt`, 'utf-8');
			const parser = parse(routeCsv, {
				columns: true,
				relax_column_count: true,
			});

			let i = 0;
			for await (const record of parser) {
				await this.fileMap[fileName].repository
					.insert(
						Object.keys(this.fileMap[fileName].columnMapping).reduce(
							(acc, fieldKey) => ({
								...acc,
								[fieldKey]: record?.[this.fileMap[fileName].columnMapping[fieldKey]],
							}),
							{},
						),
					)
					.then(() => console.log(`[${fileName}] (${i++}) OK`))
					.catch((e) => console.error(e));
			}
		}, Promise.resolve());
	}
}
