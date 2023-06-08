import { createHash } from 'crypto';

import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TABLE_PROVIDERS, TripRoute } from '@transportmap/database';
import got from 'got';

import { OpenTelemetryMessage, OpenTelemetrySeverity } from '../../../core/enum/open-telemetry.enum';
import { LoggingService } from '../../../core/services/logging.service';

@Injectable()
export class OSRMService {
	constructor(
		private readonly loggingService: LoggingService,
		@Inject(TABLE_PROVIDERS.TRIP_ROUTE_REPOSITORY) private tripRouteRepository: Repository<TripRoute>,
	) { }

	public getOsrmRoute = async (coordinates: string): Promise<string[]> => {
		const key = createHash('sha256').update(coordinates).digest('hex');
		const cachedTripRoute = await this.tripRouteRepository.findOne({ where: { key } });

		if (cachedTripRoute) {
			return cachedTripRoute.route;
		}

		// Grab the steps
		const osrmRoute: any = await got
			.get(`${process.env.OSRM_URL}/match/v1/train/${coordinates}`, {
				searchParams: {
					steps: true,
					// generate_hints: false,
					// geometries: 'geojson',
					// continue_straight: true,
					radiuses: coordinates
						.split(';')
						.map(() => 100)
						.join(';'),
					timestamps: coordinates
						.split(';')
						.map((_, i) => i * 3600)
						.join(';'),
				},
				resolveBodyOnly: true,
				responseType: 'json',
			})
			.catch((e) => {
				console.error(e.response);
				this.loggingService.captureMessage(OpenTelemetryMessage.OSRM_ROUTE_FETCH_FAIL, OpenTelemetrySeverity.WARNING, {
					radiuses: coordinates
						.split(';')
						.map(() => 100)
						.join(';'),
					timestamps: coordinates
						.split(';')
						.map((_, i) => i * 3600)
						.join(';'),
				});

				return {
					matchings: [
						{
							legs: [],
						},
					],
				};
			});

		// console.log(osrmRoute);

		// TODO: check if [0] is correct here on the steps
		const sectionCoordinates: string[] = osrmRoute.matchings[0].legs.reduce((acc, leg) => {
			if (leg?.steps?.[0]?.geometry) {
				return [...acc, leg?.steps?.[0]?.geometry];
			}

			return acc;
		}, []);

		this.tripRouteRepository.save({ key, route: sectionCoordinates })
		
		return sectionCoordinates;
	};
}
