import { Inject, Injectable } from '@nestjs/common';
import { Command } from 'nestjs-command';
import * as fs from 'fs';
import got from 'got/dist/source';
import { randomBytes } from 'crypto';
import { promisify } from 'node:util';
import { pipeline } from 'stream';
import * as AdmZip from 'adm-zip';
import {
	AgencySeederService,
	CalendarDateSeederService,
	CalendarSeederService,
	RouteSeederService,
	StopSeederService,
	StopTimeOverrideSeederService,
	StopTimeSeederService,
	TranslationSeederService,
	TripSeederService,
} from '../seeders';
import { TABLE_PROVIDERS } from 'core/providers/table.providers';
import { GTFSProcessStatus } from 'core/entities';
import { Repository } from 'typeorm';

// TODO: add realtime typings
@Injectable()
export class StaticSeederService {
	constructor(
		private readonly stopTimeSeederService: StopTimeSeederService,
		private readonly tripSeederService: TripSeederService,
		private readonly routeSeederService: RouteSeederService,
		private readonly agencySeederService: AgencySeederService,
		private readonly calendarDateSeederService: CalendarDateSeederService,
		private readonly calendarSeederService: CalendarSeederService,
		private readonly stopSeederService: StopSeederService,
		private readonly translationSeederService: TranslationSeederService,
		private readonly stopTimeOverrideSeederService: StopTimeOverrideSeederService,
		@Inject(TABLE_PROVIDERS.GTFS_PROCESS_STATUS) private gtfsProcessStatus: Repository<GTFSProcessStatus>,
	) {}

	@Command({
		command: 'seed:static',
		describe: 'Sync vehicles',
	})
	public async seedStatic() {
		console.log('[SEED] starting seeding');
		const promisePipeline = promisify(pipeline);
		const gtfsStaticSources = [
			{
				key: 'NMBS/SNCB',
				staticSourceUrl: 'https://sncb-opendata.hafas.de/gtfs/static/c21ac6758dd25af84cca5b707f3cb3de',
			},
		];

		// Daily nighttime job. Get static data
		gtfsStaticSources.reduce(async (acc, { key, staticSourceUrl }) => {
			await acc;

			const id = randomBytes(20).toString('hex');
			console.log(`[SEED] {${key}} saving file ${id}.zip`);
			await promisePipeline(got.stream(staticSourceUrl), fs.createWriteStream(`${__dirname}/../../../../tmp/rawdata_${id}.zip`));

			console.log(`[SEED] {${key}} unzipping file ${id}`);
			const zipFile = new AdmZip(`${__dirname}/../../../../tmp/rawdata_${id}.zip`);
			await new Promise((resolve) => zipFile.extractAllToAsync(`${__dirname}/../../../../tmp/${id}`, false, false, resolve));

			console.log(`[SEED] {${key}} passing files to seeders`);
			const agencyId = await this.agencySeederService.seed(id);

			await this.gtfsProcessStatus.upsert(
				{
					key: agencyId,
					processingStaticData: true,
				},
				['key'],
			);

			await this.stopTimeSeederService.seed(id, agencyId);
			await this.tripSeederService.seed(id, agencyId);
			await this.routeSeederService.seed(id, agencyId);
			await this.calendarDateSeederService.seed(id, agencyId);
			await this.calendarSeederService.seed(id, agencyId);
			await this.stopSeederService.seed(id, agencyId);
			await this.translationSeederService.seed(id, agencyId);
			// TODO: Eventually add support for transfer.
			// await this.transferService.seed(id, agencyId);

			await this.gtfsProcessStatus.upsert(
				{
					key: agencyId,
					processingStaticData: false,
				},
				['key'],
			);

			await this.stopTimeOverrideSeederService.seed(id, agencyId);

			fs.unlinkSync(`${__dirname}/../../../../tmp/rawdata_${id}.zip`);
			fs.rmSync(`${__dirname}/../../../../tmp/${id}`, { recursive: true, force: true });

			console.log(`[SEED] {${key}} seeding done`);
		}, Promise.resolve());
	}
}
