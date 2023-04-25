import { Entity, Column, PrimaryGeneratedColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Trip } from './Trip.entity';

@Entity()
export class CalendarDate {
	@PrimaryGeneratedColumn('uuid')
	@Index()
	id: string;

	@Column()
	@Index()
	date: string;

	@Column()
	@Index()
	serviceId: string;

	@Column()
	exceptionType: string;

	@ManyToOne(() => Trip, (trip) => trip.serviceId, { createForeignKeyConstraints: false })
	@JoinColumn({ name: 'serviceId', referencedColumnName: 'serviceId' })
	trip: Trip;
}
