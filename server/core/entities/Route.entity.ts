import { Entity, Column, PrimaryColumn, OneToMany, JoinColumn, Index } from 'typeorm';
import { Trip } from './Trip.entity';

@Entity()
export class Route {
	@PrimaryColumn()
	@Index()
	id: string;

	@Column()
	agencyId: string;

	@Column()
	routeCode: string;

	@Column()
	name: string;

	@Column({ nullable: true })
	description: string;

	@Column({ nullable: true })
	type: string;

	@Column({ nullable: true })
	url: string;

	@Column({ nullable: true })
	color: string;

	@Column({ nullable: true })
	textColor: string;

	@OneToMany(() => Trip, (trip) => trip.route, { createForeignKeyConstraints: false })
	trips: Trip[];
}
