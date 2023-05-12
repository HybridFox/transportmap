import { Inject, Injectable } from '@nestjs/common';
import { Command } from 'nestjs-command';
import { load } from 'protobufjs';
import got from 'got';
import { Repository } from 'typeorm';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import async from 'async';
import * as cliProgress from 'cli-progress';
import { GTFSRealtimeStatus, GTFSStaticStatus, StopTime, TABLE_PROVIDERS } from '@transportmap/database';
import { Cron } from '@nestjs/schedule';

import { SentryMessage, SentrySeverity } from '~core/enum/sentry.enum';
import { LoggingService } from '~core/services/logging.service';

import { StopTimeUpdate } from '../gtfs.types';

dayjs.extend(customParseFormat);

// TODO: add realtime typings
@Injectable()
export class RealtimeProcessorService {
	constructor(
		@Inject(TABLE_PROVIDERS.GTFS_STATIC_STATUS) private gtfsStaticStatus: Repository<GTFSStaticStatus>,
		@Inject(TABLE_PROVIDERS.GTFS_REALTIME_STATUS) private gtfsRealtimeStatus: Repository<GTFSRealtimeStatus>,
		@Inject(TABLE_PROVIDERS.STOP_TIME_REPOSITORY) private stopTimeRepository: Repository<StopTime>,
		private readonly loggingService: LoggingService,
	) {}

	@Command({
		command: 'seed:realtime',
		describe: 'Sync vehicles',
	})
	@Cron('0 * * * * *')
	public async seedRealtime() {
		const Root = await load(`${__dirname}/../../../static/protobuf/gtfs-realtime.proto`);
		const RealtimeGTFSMessage = Root.lookupType('FeedMessage');

		console.log('[REALTIME_SEED] starting realtime seeding');
		const gtfsRealtimeSources = [
			{
				key: 'NMBS/SNCB',
				sourceUrl: 'https://sncb-opendata.hafas.de/gtfs/realtime/c21ac6758dd25af84cca5b707f3cb3de',
			},
		];

		// Daily nighttime job. Get static data
		gtfsRealtimeSources.reduce(async (acc, { sourceUrl, key }) => {
			await acc;

			console.log(`[REALTIME_SEED] seeding ${key}`);

			const gtfsStaticStatus = await this.gtfsStaticStatus.findOneBy({ key });
			const gtfsRealtimeStatus = await this.gtfsRealtimeStatus.findOneBy({ key });

			if (!gtfsStaticStatus) {
				return console.log(`[REALTIME_SEED] cancelling static seeding for ${key} since a row is not found`);
			}

			if (gtfsStaticStatus.processingStaticData === true) {
				return console.log(`[REALTIME_SEED] cancelling seeding for ${key} since there is a static import running`);
			}

			const lastTimestamp = gtfsRealtimeStatus?.lastRealtimeMessageTimestamp || 0;
			console.log(`[REALTIME_SEED] last timestamp was "${lastTimestamp}"`);

			console.log('[REALTIME_SEED] grabbing protobuf');
			const protobufFile = await got(sourceUrl, {
				resolveBodyOnly: true,
				responseType: 'buffer'
			})
				.catch((e) => {
					this.loggingService.captureException(e, SentryMessage.REALTIME_GTFS_INACCESSIBLE, SentrySeverity.WARNING, { key, sourceUrl });
					throw e;
				});

			console.log('[REALTIME_SEED] decoding');
			try {
				const progressBar = new cliProgress.SingleBar(
					{
						fps: 30,
						forceRedraw: true,
						noTTYOutput: true,
						notTTYSchedule: 1000,
					},
					cliProgress.Presets.shades_classic,
				);
				const message = RealtimeGTFSMessage.decode(protobufFile);
				const { entity: feedMessages } = RealtimeGTFSMessage.toObject(message, {
					longs: Number,
				});

				if (!feedMessages) {
					this.loggingService.captureMessage(SentryMessage.REALTIME_GTFS_FEED_EMPTY, SentrySeverity.WARNING, {
						key,
						sourceUrl,
						protobufFile,
					});

					return;
				}

				if (!feedMessages.length) {
					return;
				}

				const queue = async.queue(async ({ tripId, stopTimeUpdate }, callback) => {
					await this.processStopTimeUpdate(tripId, stopTimeUpdate);
					progressBar.increment();
					callback();
				}, 50);

				console.log('[REALTIME_SEED] sending to queue');

				feedMessages
					.filter((feedMessage) => feedMessage.tripUpdate.timestamp > lastTimestamp)
					.forEach((feedMessage) => {
						if (!feedMessage.tripUpdate?.stopTimeUpdate) {
							// TODO: handle other types of messages.
							return;
						}

						const tripId = feedMessage.tripUpdate.trip.tripId;
						feedMessage.tripUpdate.stopTimeUpdate.forEach((stopTimeUpdate) => {
							queue.push({ tripId, stopTimeUpdate });
						}, Promise.resolve());
					});

				console.log('[REALTIME_SEED] down the drain');
				progressBar.start(queue.length(), 0);
				await queue.drain();

				progressBar.stop();
				console.log('[REALTIME_SEED] updating realtime done');
				const newTimestamp = Math.max(...feedMessages.map((feedMessage) => feedMessage.tripUpdate.timestamp));
				await this.gtfsRealtimeStatus.upsert(
					{
						key,
						lastRealtimeMessageTimestamp: newTimestamp,
					},
					['key'],
				);
			} catch (e) {
				console.error(e);

				this.loggingService.captureException(e, SentryMessage.REALTIME_GTFS_GENERIC_FAIL, SentrySeverity.WARNING, {
					key,
					sourceUrl,
				});
			}
		}, Promise.resolve());
	}

	private async processStopTimeUpdate(tripId: string, stopTimeUpdate: StopTimeUpdate): Promise<void> {
		if (stopTimeUpdate.arrival && stopTimeUpdate.arrival.delay !== 0) {
			// Update arrival time
			// TODO: check if it is possible to handle this in PG. Will prevent double op
			// TODO: does the realtime data pass the stopId as defined in stop_times.txt or stop_time_overrides.txt?
			const currentStopTime = await this.stopTimeRepository.findOneBy({ tripId, stopId: stopTimeUpdate.stopId });

			if (currentStopTime) {
				const newTime = dayjs(currentStopTime.arrivalTime, 'HH:mm:ss').add(stopTimeUpdate.arrival.delay, 'seconds').format('HH:mm:ss');
				await this.stopTimeRepository.update({ tripId, stopId: stopTimeUpdate.stopId }, { realtimeArrivalTime: newTime });
			} else {
				console.error('stop not found', tripId, stopTimeUpdate.stopId);
			}
		}

		if (stopTimeUpdate.departure && stopTimeUpdate.departure.delay !== 0) {
			// Update departure time
			// TODO: check if it is possible to handle this in PG. Will prevent double op
			// TODO: does the realtime data pass the stopId as defined in stop_times.txt or stop_time_overrides.txt?
			const currentStopTime = await this.stopTimeRepository.findOneBy({ tripId, stopId: stopTimeUpdate.stopId });

			if (currentStopTime) {
				const newTime = dayjs(currentStopTime.departureTime, 'HH:mm:ss').add(stopTimeUpdate.departure.delay, 'seconds').format('HH:mm:ss');
				await this.stopTimeRepository.update({ tripId, stopId: stopTimeUpdate.stopId }, { realtimeDepartureTime: newTime });
			} else {
				console.error('stop not found', tripId, stopTimeUpdate.stopId);
			}
		}
	}
}
