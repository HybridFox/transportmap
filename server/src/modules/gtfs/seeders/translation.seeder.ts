import { Inject, Injectable } from '@nestjs/common';
import { parse } from 'csv-parse';
import * as fs from 'fs';
import { Translation } from 'core/entities';
import { Repository } from 'typeorm';
import { TABLE_PROVIDERS } from 'core/providers/table.providers';
import * as async from 'async';
import * as cliProgress from 'cli-progress';

@Injectable()
export class TranslationSeederService {
	constructor(@Inject(TABLE_PROVIDERS.TRANSLATION_REPOSITORY) private translationRepository: Repository<Translation>) {}

	public async seed(temporaryIdentifier: string, agencyId: string) {
		const routeCsv = fs.readFileSync(`${__dirname}/../../../../tmp/${temporaryIdentifier}/translations.txt`, 'utf-8');
		const parser = parse(routeCsv, {
			columns: true,
			relax_column_count: true,
		});
		const progressBar = new cliProgress.SingleBar(
			{
				fps: 30,
				forceRedraw: true,
				noTTYOutput: true,
				notTTYSchedule: 1000,
			},
			{
				format: '[SEED] {TRANSLATION} {bar} {percentage}% | ETA: {eta}s | {value}/{total}',
				barCompleteChar: '\u2588',
				barIncompleteChar: '\u2591',
			},
		);

		const q = async.cargoQueue(
			async (records: any[], callback) => {
				await this.translationRepository.insert(
					records.map((record) => ({
						translationKey: record.trans_id,
						language: record.lang,
						translation: record.translation,
						agencyId,
					})),
				);

				progressBar.increment(records.length);
				callback();
			},
			5,
			500,
		);

		console.log('[SEED] {TRANSLATION} truncate table');
		await this.translationRepository.delete({
			agencyId,
		});

		console.log('[SEED] {TRANSLATION} queue records');
		for await (const record of parser) {
			q.push(record);
		}

		console.log('[SEED] {TRANSLATION} down the drain');
		progressBar.start(q.length(), 0);
		await q.drain();
		progressBar.stop();
		console.log('[SEED] {TRANSLATION} sink empty');
	}
}
