import * as fs from 'fs';

import { Inject, Injectable } from '@nestjs/common';
import { parse } from 'csv-parse/sync';
import { Repository } from 'typeorm';

import { Agency } from '~core/entities';
import { TABLE_PROVIDERS } from '~core/providers/table.providers';

@Injectable()
export class AgencySeederService {
	constructor(@Inject(TABLE_PROVIDERS.AGENCY_REPOSITORY) private agencyRepository: Repository<Agency>) {}

	public async seed(temporaryIdentifier: string): Promise<string> {
		const routeCsv = fs.readFileSync(`${__dirname}/../../tmp/${temporaryIdentifier}/agency.txt`, 'utf-8');
		const records = parse(routeCsv, {
			columns: true,
			relax_column_count: true,
		});

		const record = records[0];
		console.log(`[SEED] {AGENCY} got agency id ${record.agency_id}`);
		await this.agencyRepository.upsert(
			{
				id: record.agency_id,
				name: record.agency_name,
				url: record.agency_url,
				timezone: record.agency_timezone,
				language: record.agency_lang,
				phoneNumber: record.agency_phone,
			},
			['id'],
		);

		console.log(`[SEED] {AGENCY} agency seeded`);

		return record.agency_id;
	}
}
