import { DataSource } from 'typeorm';

import { Entities } from '~core/entities';

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
				entities: [...Entities],
				synchronize: true,
				cache: true,
			});

			return dataSource.initialize();
		},
	},
];
