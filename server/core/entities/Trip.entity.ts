import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { Route } from './Route.entity';
import { StopTime } from './StopTime.entity';

@Entity()
export class Trip {
	@PrimaryColumn()
	@Index()
	id: string;

	@Column()
	@Index()
	routeId: string;

	@Column()
	@Index()
	serviceId: string;

	@Column()
	headsign: string;

	@Column({ nullable: true })
	name: string;

	@Column()
	directionId: string;

	@Column()
	blockId: string;

	@Column({ nullable: true })
	shapeId: string;

	@Column({ nullable: true })
	type: string;

	@ManyToOne(() => Route, (route) => route.id, { createForeignKeyConstraints: false })
	@JoinColumn({ name: 'routeId', referencedColumnName: 'id' })
	route: Route;

	@OneToMany(() => StopTime, (stop) => stop.trip, { createForeignKeyConstraints: false })
	stopTimes: StopTime[];
}
