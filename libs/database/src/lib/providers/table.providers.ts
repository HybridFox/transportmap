import { DataSource } from 'typeorm';

import * as Entites from '../entities';

import { DATABASE_PROVIDERS } from './database.providers';

export enum TABLE_PROVIDERS {
	AGENCY_REPOSITORY = 'AGENCY_REPOSITORY',
	CALENDAR_REPOSITORY = 'CALENDAR_REPOSITORY',
	CALENDAR_DATE_REPOSITORY = 'CALENDAR_DATE_REPOSITORY',
	ROUTE_REPOSITORY = 'ROUTE_REPOSITORY',
	STOP_REPOSITORY = 'STOP_REPOSITORY',
	STOP_TIME_REPOSITORY = 'STOP_TIME_REPOSITORY',
	TRANSFER_REPOSITORY = 'TRANSFER_REPOSITORY',
	TRANSLATION_REPOSITORY = 'TRANSLATION_REPOSITORY',
	TRIP_REPOSITORY = 'TRIP_REPOSITORY',
	GTFS_STATIC_STATUS = 'GTFS_STATIC_STATUS',
	GTFS_REALTIME_STATUS = 'GTFS_REALTIME_STATUS',
	CALCULATED_TRIP_REPOSITORY = 'CALCULATED_TRIP_REPOSITORY',
	COMPOSITION_REPOSITORY = 'COMPOSITION_REPOSITORY',
}

export const columnProviders = [
	{
		provide: TABLE_PROVIDERS.AGENCY_REPOSITORY,
		useFactory: (dataSource: DataSource) => dataSource.getRepository(Entites.Agency),
		inject: [DATABASE_PROVIDERS.POSTGRES],
	},
	{
		provide: TABLE_PROVIDERS.CALENDAR_REPOSITORY,
		useFactory: (dataSource: DataSource) => dataSource.getRepository(Entites.Calendar),
		inject: [DATABASE_PROVIDERS.POSTGRES],
	},
	{
		provide: TABLE_PROVIDERS.CALENDAR_DATE_REPOSITORY,
		useFactory: (dataSource: DataSource) => dataSource.getRepository(Entites.CalendarDate),
		inject: [DATABASE_PROVIDERS.POSTGRES],
	},
	{
		provide: TABLE_PROVIDERS.ROUTE_REPOSITORY,
		useFactory: (dataSource: DataSource) => dataSource.getRepository(Entites.Route),
		inject: [DATABASE_PROVIDERS.POSTGRES],
	},
	{
		provide: TABLE_PROVIDERS.STOP_REPOSITORY,
		useFactory: (dataSource: DataSource) => dataSource.getRepository(Entites.Stop),
		inject: [DATABASE_PROVIDERS.POSTGRES],
	},
	{
		provide: TABLE_PROVIDERS.STOP_TIME_REPOSITORY,
		useFactory: (dataSource: DataSource) => dataSource.getRepository(Entites.StopTime),
		inject: [DATABASE_PROVIDERS.POSTGRES],
	},
	{
		provide: TABLE_PROVIDERS.TRANSFER_REPOSITORY,
		useFactory: (dataSource: DataSource) => dataSource.getRepository(Entites.Transfer),
		inject: [DATABASE_PROVIDERS.POSTGRES],
	},
	{
		provide: TABLE_PROVIDERS.TRANSLATION_REPOSITORY,
		useFactory: (dataSource: DataSource) => dataSource.getRepository(Entites.Translation),
		inject: [DATABASE_PROVIDERS.POSTGRES],
	},
	{
		provide: TABLE_PROVIDERS.TRIP_REPOSITORY,
		useFactory: (dataSource: DataSource) => dataSource.getRepository(Entites.Trip),
		inject: [DATABASE_PROVIDERS.POSTGRES],
	},
	{
		provide: TABLE_PROVIDERS.GTFS_REALTIME_STATUS,
		useFactory: (dataSource: DataSource) => dataSource.getRepository(Entites.GTFSRealtimeStatus),
		inject: [DATABASE_PROVIDERS.POSTGRES],
	},
	{
		provide: TABLE_PROVIDERS.GTFS_STATIC_STATUS,
		useFactory: (dataSource: DataSource) => dataSource.getRepository(Entites.GTFSStaticStatus),
		inject: [DATABASE_PROVIDERS.POSTGRES],
	},
	{
		provide: TABLE_PROVIDERS.CALCULATED_TRIP_REPOSITORY,
		useFactory: (dataSource: DataSource) => dataSource.getRepository(Entites.CalculatedTrip),
		inject: [DATABASE_PROVIDERS.MONGODB],
	},
	{
		provide: TABLE_PROVIDERS.COMPOSITION_REPOSITORY,
		useFactory: (dataSource: DataSource) => dataSource.getRepository(Entites.Composition),
		inject: [DATABASE_PROVIDERS.MONGODB],
	},
];
