import { Inject, Injectable } from '@nestjs/common';
import { Like, MongoRepository, Repository } from 'typeorm';
import { CalculatedTrip, Stop, TABLE_PROVIDERS, Translation, mongoDataSource } from '@transportmap/database';
import { pick } from 'ramda';

@Injectable()
export class SearchService {
	private tripCacheRepository: MongoRepository<CalculatedTrip>;

	constructor(
		@Inject(TABLE_PROVIDERS.STOP_REPOSITORY) private stopRepository: Repository<Stop>,
	) {
		this.tripCacheRepository = mongoDataSource.getMongoRepository(CalculatedTrip);
	}

	public async search(query: Record<string, string>): Promise<{
		trips: Partial<CalculatedTrip>[],
		stops: Partial<Stop>[]
	}> {
		if (!query.q || query.q.length < 3) {
			return {
				trips: [],
				stops: []
			}
		}
		
		const match = new RegExp(query.q, "i");
		const [trips, stops] = await Promise.all([
			this.tripCacheRepository.find({
				limit: 3,
				where: {
					...(query.q && {
						$or: [
							{ name: { $regex: match } },
							{ headsign: { $regex: match } },
							{ 'route.name': { $regex: match } },
							{ 'route.routeCode': { $regex: match } },
						]
					}),
					...(query.west && query.north && query.east && query.south && {
						'sectionLocation': { $geoWithin: { $box:  [ [Number(query.west), Number(query.north)], [Number(query.east), Number(query.south)] ] } }
					})
				},
			}),
			this.stopRepository.createQueryBuilder('stop')
				.leftJoinAndSelect('stop.translations', 'filterTranslations')
				.where('LOWER(filterTranslations.translation) LIKE :q', { q: `%${query.q.toLocaleLowerCase()}%`})
				// TODO: find a fix for this double join
				.leftJoinAndSelect('stop.translations', 'translations')
				.andWhere(`stop.id NOT LIKE '%\\_%'`)
				.take(3)
				.getMany()
		]);

		console.log(trips)

		return {
			trips: trips
				.map((trip) => ({
					...pick(['osrmRoute', 'route', 'id', 'name'])(trip),
					sections: trip.sections.map((section) => pick(['startTime', 'realStartTime', 'endTime', 'realEndTime'])(section))
				})),
			stops: stops
				.map((trip) => pick(['id', 'name', 'translations', 'latitude', 'longitude'])(trip))
		}
	}
}
