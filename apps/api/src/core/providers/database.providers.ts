import { DataSource } from 'typeorm';

import { PostgresEntities, MongoEntities } from '~core/entities';

export enum DATABASE_PROVIDERS {
	POSTGRES = 'POSTGRES',
	MONGODB = 'MONGODB',
}

export const postgresDatasource = new DataSource({
	type: 'postgres',
	host: 'transportmap-postgres',
	port: Number(process.env.POSTGRES_PORT || 5432),
	username: process.env.POSTGRES_USERNAME,
	password: process.env.POSTGRES_PASSWORD,
	database: process.env.POSTGRES_DATABASE,
	entities: [...PostgresEntities],
	synchronize: true,
	cache: true,
});


export const mongoDataSource = new DataSource({
	type: 'mongodb',
	host: 'transportmap-mongo',
	port: Number(process.env.MONGO_PORT),
	username: process.env.MONGO_USERNAME,
	password: process.env.MONGO_PASSWORD,
	database: process.env.MONGO_DATABASE,
	authSource: process.env.MONGO_AUTH_SOURCE,
	entities: [...MongoEntities],
	synchronize: true,
	cache: true,
});


export const databaseProviders = [
	{
		provide: DATABASE_PROVIDERS.POSTGRES,
		useFactory: async () => {
			return postgresDatasource.initialize();
		},
	},
	{
		provide: DATABASE_PROVIDERS.MONGODB,
		useFactory: async () => {
			return mongoDataSource.initialize();
		},
	},
];
