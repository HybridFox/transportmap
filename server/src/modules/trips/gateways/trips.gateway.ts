import { Injectable } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { redis } from '../../core/instances/redis.instance';
import { TripsService } from '../services/trips.service';
import { getCenter, getDistance } from 'geolib';
import { pick } from 'ramda';

@Injectable()
@WebSocketGateway(Number(process.env.PORT), { transports: ['websocket'] })
export class TripsGateway {
	@WebSocketServer() private server: Server;

	// private async emitLocations(): Promise<void> {
	// 	if (!this.server) {
	// 		return;
	// 	}

	// 	const clients = Array.from(this.server.sockets.sockets, ([id, socket]) => ({ id, socket }));
	// 	clients.forEach(async ({ id, socket }) => this.sendTrips(socket));
	// }

	private async sendTrips(socket: Socket, bbox: string): Promise<void> {
		console.time('--- TOTAL');
		// const bbox = await redis.get(`BBOX:${socket.id}`);

		// if (!bbox) {
		// 	return;
		// }

		const [north, east, south, west] = bbox.split(':').map((x) => Number(x));

		const center = getCenter([
			{
				lat: north,
				lon: east,
			},
			{
				lat: south,
				lon: west,
			},
		]);

		if (!center) {
			return;
		}

		const distance = getDistance(
			{
				lat: north,
				lon: east,
			},
			{
				lat: south,
				lon: west,
			},
		);

		console.time('geosearch');
		const tripIds = await redis.geosearch(
			'TRIPLOCATIONS',
			'FROMLONLAT',
			center.longitude,
			center.latitude,
			'BYBOX',
			distance,
			distance,
			'm',
			'ASC',
			'WITHCOORD',
			'WITHDIST',
		);
		console.timeEnd('geosearch');

		if (tripIds.length === 0) {
			return;
		}

		// TODO: fix
		console.time('trips');
		const trips = await redis.mget(...tripIds.map(([id]) => `TRIPS:NMBS/SNCB:${id}`));
		console.timeEnd('trips');

		console.time('calc');
		const calculatedTrips = trips
			.filter((trip) => !!trip)
			.map((trip) => JSON.parse(trip))
			.map((trip) => pick(['strippedOsrmRoute', 'route', 'sections', 'id'])(trip));
		console.timeEnd('calc');
		console.time('socket');
		socket.compress(true).emit('RCVTRIPS', calculatedTrips);
		console.timeEnd('socket');
		console.timeEnd('--- TOTAL');
	}

	@SubscribeMessage('SETBBOX')
	async handleEvent(@MessageBody() data: Record<string, number>, @ConnectedSocket() socket: Socket): Promise<void> {
		await redis.set(`BBOX:${socket.id}`, `${data.north}:${data.east}:${data.south}:${data.west}`);
		await redis.expire(`BBOX:${socket.id}`, 60 * 60);

		// TODO: Return latest data when setting bbox
		// TODO: Validate max zoom, so that scraping can be impossible i guess
		this.sendTrips(socket, `${data.north}:${data.east}:${data.south}:${data.west}`);
	}
}
