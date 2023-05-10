import { Injectable } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'ws';
import { pick } from 'ramda';
import { MongoRepository } from 'typeorm';

// import { redis } from '~core/instances/redis.instance';
import { CalculatedTrip, mongoDataSource } from '@transportmap/database';

@Injectable()
@WebSocketGateway()
export class TripsGateway {
	@WebSocketServer() private server: Server;
	private tripCacheRepository: MongoRepository<CalculatedTrip>;

	constructor() {
		this.tripCacheRepository = mongoDataSource.getMongoRepository(CalculatedTrip);
	}

	// private async emitLocations(): Promise<void> {
	// 	if (!this.server) {
	// 		return;
	// 	}

	// 	const clients = Array.from(this.server.sockets.sockets, ([id, socket]) => ({ id, socket }));
	// 	clients.forEach(async ({ id, socket }) => this.sendTrips(socket));
	// }

	private async sendTrips(socket: any, bbox: string): Promise<void> {
		console.time('--- TOTAL');
		// const bbox = await redis.get(`BBOX:${socket.id}`);

		// if (!bbox) {
		// 	return;
		// }

		const [north, east, south, west] = bbox.split(':').map((x) => Number(x));

		console.time('trips');
		const trips = await this.tripCacheRepository.find({
			'sectionLocation': { $geoWithin: { $box:  [ [west, north], [east, south] ] } }
		})
		console.timeEnd('trips');
		// console.log('b' trips.length)

		console.time('calc');
		const calculatedTrips = trips
			.filter((trip) => !!trip)
			.map((trip) => pick(['osrmRoute', 'route', 'sections', 'id', 'name'])(trip));
		console.timeEnd('calc');

		console.log('socket', socket.emit())
		console.time('socket');
		socket.emit(JSON.stringify({
			event: 'RCVTRIPS',
			data: calculatedTrips,
		}));
		console.timeEnd('socket');
		console.timeEnd('--- TOTAL');
	}

	@SubscribeMessage('SETBBOX')
	async handleEvent(@MessageBody() data: Record<string, number>, @ConnectedSocket() socket: any): Promise<void> {
		// console.log(socket.emit)
		// await redis.set(`BBOX:${socket.id}`, `${data.north}:${data.east}:${data.south}:${data.west}`);
		// await redis.expire(`BBOX:${socket.id}`, 60 * 60);
		// console.log('message', socket)

		// TODO: Return latest data when setting bbox
		// TODO: Validate max zoom, so that scraping can be impossible i guess
		this.sendTrips(socket, `${data.north}:${data.east}:${data.south}:${data.west}`);
	}
}
