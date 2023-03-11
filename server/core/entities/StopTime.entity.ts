import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Stop } from './Stop.entity';
import { Trip } from './Trip.entity';

@Entity()
export class StopTime {
	@PrimaryGeneratedColumn('uuid')
	@Index()
	id: string;

	@Column()
	@Index()
	tripId: string;

	@Column()
	arrivalTime: string;

	@Column()
	departureTime: string;

	@Column()
	@Index()
	stopId: string;

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
	trip: Trip;

	@ManyToOne(() => Stop, (stop) => stop.id, { createForeignKeyConstraints: false })
	@JoinColumn({ name: 'stopId', referencedColumnName: 'id' })
	stop: Stop;
}
