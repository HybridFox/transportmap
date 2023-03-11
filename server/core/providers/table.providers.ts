import * as Entites from '../entities';
import { DataSource } from 'typeorm';
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
}

export const columnProviders = [
	{
		provide: TABLE_PROVIDERS.AGENCY_REPOSITORY,
		useFactory: (dataSource: DataSource) => dataSource.getRepository(Entites.Agency),
		inject: [DATABASE_PROVIDERS.DATA_SOURCE],
	},
	{
		provide: TABLE_PROVIDERS.CALENDAR_REPOSITORY,
		useFactory: (dataSource: DataSource) => dataSource.getRepository(Entites.Calendar),
		inject: [DATABASE_PROVIDERS.DATA_SOURCE],
	},
	{
		provide: TABLE_PROVIDERS.CALENDAR_DATE_REPOSITORY,
		useFactory: (dataSource: DataSource) => dataSource.getRepository(Entites.CalendarDate),
		inject: [DATABASE_PROVIDERS.DATA_SOURCE],
	},
	{
		provide: TABLE_PROVIDERS.ROUTE_REPOSITORY,
		useFactory: (dataSource: DataSource) => dataSource.getRepository(Entites.Route),
		inject: [DATABASE_PROVIDERS.DATA_SOURCE],
	},
	{
		provide: TABLE_PROVIDERS.STOP_REPOSITORY,
		useFactory: (dataSource: DataSource) => dataSource.getRepository(Entites.Stop),
		inject: [DATABASE_PROVIDERS.DATA_SOURCE],
	},
	{
		provide: TABLE_PROVIDERS.STOP_TIME_REPOSITORY,
		useFactory: (dataSource: DataSource) => dataSource.getRepository(Entites.StopTime),
		inject: [DATABASE_PROVIDERS.DATA_SOURCE],
	},
	{
		provide: TABLE_PROVIDERS.TRANSFER_REPOSITORY,
		useFactory: (dataSource: DataSource) => dataSource.getRepository(Entites.Transfer),
		inject: [DATABASE_PROVIDERS.DATA_SOURCE],
	},
	{
		provide: TABLE_PROVIDERS.TRANSLATION_REPOSITORY,
		useFactory: (dataSource: DataSource) => dataSource.getRepository(Entites.Translation),
		inject: [DATABASE_PROVIDERS.DATA_SOURCE],
	},
	{
		provide: TABLE_PROVIDERS.TRIP_REPOSITORY,
		useFactory: (dataSource: DataSource) => dataSource.getRepository(Entites.Trip),
		inject: [DATABASE_PROVIDERS.DATA_SOURCE],
	},
];
