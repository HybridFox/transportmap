import { Repository } from 'typeorm';

import { Agency, Calendar, CalendarDate, Route, Stop, StopTime, Trip } from '~core/entities';

interface GTFSFileMapProps {
	stopTimeRepository: Repository<StopTime>;
	tripRepository: Repository<Trip>;
	routeRepository: Repository<Route>;
	agencyRepository: Repository<Agency>;
	calendarDateRepository: Repository<CalendarDate>;
	calendarRepository: Repository<Calendar>;
	stopRepository: Repository<Stop>;
}

export const gtfsFileMap = ({
	stopTimeRepository,
	tripRepository,
	routeRepository,
	agencyRepository,
	calendarDateRepository,
	calendarRepository,
	stopRepository,
}: GTFSFileMapProps) => ({
	stop_times: {
		repository: stopTimeRepository,
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
		repository: tripRepository,
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
		repository: routeRepository,
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
		repository: agencyRepository,
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
		repository: calendarDateRepository,
		requiresId: true,
		columnMapping: {
			serviceId: 'service_id',
			date: 'date',
			exceptionType: 'exception_type',
		},
	},
	calendar: {
		repository: calendarRepository,
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
		repository: stopRepository,
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
});
