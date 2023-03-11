import { DataSource } from 'typeorm';

export enum DATABASE_PROVIDERS {
	DATA_SOURCE = 'DATA_SOURCE',
}

export const databaseProviders = [
	{
		provide: DATABASE_PROVIDERS.DATA_SOURCE,
		useFactory: async () => {
			const dataSource = new DataSource({
				type: 'postgres',
				host: 'transportmap-postgres',
				port: 5432,
				username: process.env.POSTGRES_USERNAME,
				password: process.env.POSTGRES_PASSWORD,
				database: process.env.POSTGRES_DATABASE,
				entities: [__dirname + '/../entities/**/*.entity{.ts,.js}'],
				synchronize: true,
			});

			return dataSource.initialize();
		},
	},
];
