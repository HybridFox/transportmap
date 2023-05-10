import * as fs from 'fs';
import { randomBytes } from 'crypto';
import { promisify } from 'node:util';
import { pipeline } from 'stream';

import got from 'got';
import { Command } from 'nestjs-command';
import { Inject, Injectable } from '@nestjs/common';
import * as AdmZip from 'adm-zip';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { GTFSStaticStatus, TABLE_PROVIDERS } from '@transportmap/database';

import {
	AgencyStaticProducerService,
	CalendarDateStaticProducerService,
	CalendarStaticProducerService,
	RouteStaticProducerService,
	StopStaticProducerService,
	StopTimeOverrideStaticProducerService,
	StopTimeStaticProducerService,
	TranslationStaticProducerService,
	TripStaticProducerService,
} from '../static-producers';

// TODO: add realtime typings
@Injectable()
export class StaticStaticProducerService {
	constructor(
		private readonly stopTimeStaticProducerService: StopTimeStaticProducerService,
		private readonly tripStaticProducerService: TripStaticProducerService,
		private readonly routeStaticProducerService: RouteStaticProducerService,
		private readonly agencyStaticProducerService: AgencyStaticProducerService,
		private readonly calendarDateStaticProducerService: CalendarDateStaticProducerService,
		private readonly calendarStaticProducerService: CalendarStaticProducerService,
		private readonly stopStaticProducerService: StopStaticProducerService,
		private readonly translationStaticProducerService: TranslationStaticProducerService,
		private readonly stopTimeOverrideStaticProducerService: StopTimeOverrideStaticProducerService,
		@Inject(TABLE_PROVIDERS.GTFS_STATIC_STATUS) private gtfsProcessStatus: Repository<GTFSStaticStatus>,
	) {}

	@Command({
		command: 'seed:static',
		describe: 'Sync vehicles',
	})
	@Cron('0 2 * * *')
	public async seedStatic() {
		console.log('[SEED] starting seeding');
		const promisePipeline = promisify(pipeline);
		const gtfsStaticSources = [
			{
				key: 'NMBS/SNCB',
				staticSourceUrl: 'https://sncb-opendata.hafas.de/gtfs/static/c21ac6758dd25af84cca5b707f3cb3de',
			},
			// {
			// 	key: 'OV_NL',
			// 	staticSourceUrl: 'http://gtfs.ovapi.nl/gtfs-nl.zip',
			// },
			// {
			// 	key: 'De Lijn',
			// 	staticSourceUrl: 'https://gtfs.irail.be/de-lijn/de_lijn-gtfs.zip',
			// },
		];

		// Daily nighttime job. Get static data
		gtfsStaticSources.reduce(async (acc, { key, staticSourceUrl }) => {
			await acc;

			const id = randomBytes(20).toString('hex');
			console.log(`[SEED] {${key}} saving file ${id}.zip`);
			await promisePipeline(got.stream(staticSourceUrl), fs.createWriteStream(`${__dirname}/../../tmp/rawdata_${id}.zip`));

			console.log(`[SEED] {${key}} unzipping file ${id}`);
			const zipFile = new AdmZip(`${__dirname}/../../tmp/rawdata_${id}.zip`);
			await new Promise((resolve) => zipFile.extractAllToAsync(`${__dirname}/../../tmp/${id}`, false, false, resolve));

			console.log(`[SEED] {${key}} passing files to seeders`);
			await this.agencyStaticProducerService.seed(id, key);

			await this.gtfsProcessStatus.upsert(
				{
					key,
					processingStaticData: true,
				},
				['key'],
			);

			await this.stopTimeStaticProducerService.seed(id, key);
			await this.tripStaticProducerService.seed(id, key);
			await this.routeStaticProducerService.seed(id, key);
			await this.calendarDateStaticProducerService.seed(id, key);
			await this.calendarStaticProducerService.seed(id, key);
			await this.stopStaticProducerService.seed(id, key);
			await this.translationStaticProducerService.seed(id, key);
			// TODO: Eventually add support for transfer.
			// await this.transferService.seed(id, key);

			setTimeout(() => this.stopTimeOverrideStaticProducerService.seed(id, key), 5 * 60 * 1000);

			await this.gtfsProcessStatus.upsert(
				{
					key,
					processingStaticData: false,
				},
				['key'],
			);

			fs.unlinkSync(`${__dirname}/../../tmp/rawdata_${id}.zip`);
			fs.rmSync(`${__dirname}/../../tmp/${id}`, { recursive: true, force: true });

			console.log(`[SEED] {${key}} seeding done`);
		}, Promise.resolve());
	}
}
