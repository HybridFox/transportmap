import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, OneToMany, Index, OneToOne } from 'typeorm';

import { Calendar } from './Calendar.entity';
import { CalendarDate } from './CalendarDate.entity';
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
	agencyId: string;

	@Column()
	blockId: string;

	@Column({ nullable: true })
	shapeId: string;

	@Column({ nullable: true })
	type: string;

	@ManyToOne(() => Route, (route) => route.id, { createForeignKeyConstraints: false })
	@JoinColumn({ name: 'routeId', referencedColumnName: 'id' })
	route: Route;

	@OneToOne(() => Calendar, (calendar) => calendar.serviceId, { createForeignKeyConstraints: false })
	@JoinColumn({ name: 'serviceId', referencedColumnName: 'serviceId' })
	calendar: Calendar;

	@OneToMany(() => CalendarDate, (calendarDate) => calendarDate.trip, { createForeignKeyConstraints: false })
	calendarDates: CalendarDate[];

	@OneToMany(() => StopTime, (stop) => stop.trip, { createForeignKeyConstraints: false })
	stopTimes: StopTime[];
}
