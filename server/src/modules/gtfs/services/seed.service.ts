import { Inject, Injectable } from '@nestjs/common';
import { Command } from 'nestjs-command';
import { parse } from 'csv-parse';
import * as fs from 'fs';
import { Agency, Calendar, CalendarDate, Route, Stop, StopTime, Transfer, Translation, Trip } from 'core/entities';
import { Repository } from 'typeorm';
import { TABLE_PROVIDERS } from 'core/providers/table.providers';
import { randomUUID } from 'crypto';
import { gtfsFileMap } from '../gtfs.const';
import got from 'got/dist/source';
import { randomBytes } from 'crypto';
import { promisify } from 'node:util';
import { pipeline } from 'stream';
import * as AdmZip from 'adm-zip';
import { StopTimeSeederService } from '../seeders/stop-time.seeder';

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
		// @Inject(TABLE_PROVIDERS.AGENCY_REPOSITORY) private agencyRepository: Repository<Agency>,
		// @Inject(TABLE_PROVIDERS.CALENDAR_DATE_REPOSITORY) private calendarDateRepository: Repository<CalendarDate>,
		// @Inject(TABLE_PROVIDERS.CALENDAR_REPOSITORY) private calendarRepository: Repository<Calendar>,
		// @Inject(TABLE_PROVIDERS.ROUTE_REPOSITORY) private routeRepository: Repository<Route>,
		// @Inject(TABLE_PROVIDERS.STOP_TIME_REPOSITORY) private stopTimeRepository: Repository<StopTime>,
		// @Inject(TABLE_PROVIDERS.STOP_REPOSITORY) private stopRepository: Repository<Stop>,
		// @Inject(TABLE_PROVIDERS.TRANSFER_REPOSITORY) private transferRepository: Repository<Transfer>,
		// @Inject(TABLE_PROVIDERS.TRANSLATION_REPOSITORY) private translationRepository: Repository<Translation>,
		// @Inject(TABLE_PROVIDERS.TRIP_REPOSITORY) private tripRepository: Repository<Trip>,
		private readonly stopTimeSeederService: StopTimeSeederService,
	) {}

	@Command({
		command: 'seed',
		describe: 'Sync vehicles',
	})
	public async seed() {
		console.log('- Starting nightly seeding');
		const promisePipeline = promisify(pipeline);
		const gtfsStaticSources = ['https://sncb-opendata.hafas.de/gtfs/static/c21ac6758dd25af84cca5b707f3cb3de'];

		// Daily nighttime job. Get static data
		gtfsStaticSources.reduce(async (acc, staticSourceUrl) => {
			await acc;

			// const id = randomBytes(20).toString('hex');
			// console.log(`-- saving file ${id}.zip`);
			// await promisePipeline(
			// 	got.stream(staticSourceUrl),
			// 	fs.createWriteStream(`${__dirname}/../../../../tmp/rawdata_${id}.zip`),
			// );

			// console.log(`-- unzipping file ${id}`);
			// const zipFile = new AdmZip(`${__dirname}/../../../../tmp/rawdata_${id}.zip`);
			// await new Promise((resolve) =>
			// 	zipFile.extractAllToAsync(`${__dirname}/../../../../tmp/${id}`, false, false, resolve),
			// );

			// console.log('-- passing files to seeders');
			await this.stopTimeSeederService.seed(`72bffedfac86c04e32d36b23a72c2afbbec502fe`);
		}, Promise.resolve());
	}
}
