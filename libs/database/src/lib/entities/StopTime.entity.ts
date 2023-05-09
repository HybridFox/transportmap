import { Entity, Column, ManyToOne, JoinColumn, Index, PrimaryColumn } from 'typeorm';

import { Stop } from './Stop.entity';
import { Trip } from './Trip.entity';

@Entity()
export class StopTime {
	@PrimaryColumn()
	@Index()
	id: string;

	@Column()
	@Index()
	tripId: string;

	@Column()
	@Index()
	importId: string;

	@Column()
	@Index()
	arrivalTime: string;

	@Column({ nullable: true })
	@Index()
	realtimeArrivalTime: string;

	@Column()
	@Index()
	departureTime: string;

	@Column({ nullable: true })
	@Index()
	realtimeDepartureTime: string;

	@Column()
	@Index()
	stopId: string;

	@Column({ nullable: true })
	@Index()
	stopIdOverride: string;

	@Column({ nullable: true })
	stopSequence: number;

	@Column({ nullable: true })
	stopHeadsign: string;

	@Column({ nullable: true })
	pickupType: string;

	@Column({ nullable: true })
	dropOffType: string;

	@Column({ nullable: true })
	shapeDistTraveled: string;

	@ManyToOne(() => Trip, (trip) => trip.id, { createForeignKeyConstraints: false })
	@JoinColumn({ name: 'tripId', referencedColumnName: 'id' })
	trip: any;

	@ManyToOne(() => Stop, (stop) => stop.id, { createForeignKeyConstraints: false })
	@JoinColumn({ name: 'stopId', referencedColumnName: 'id' })
	stop: Stop;
}
