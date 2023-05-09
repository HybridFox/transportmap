import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, OneToMany, Index, OneToOne } from 'typeorm';

import { Calendar } from './Calendar.entity';
import { CalendarDate } from './CalendarDate.entity';
import { Route } from './Route.entity';
import { StopTime } from './StopTime.entity';

// 'id',                 'routeId',
//    'serviceId',          'headsign',
//    'name',               'directionId',
//    'agencyId',           'blockId',
//    'shapeId',            'type',
//    'stopTimes',          'route',
//    'firstDepartureTime', 'lastDepartureTime',
//    'sectionLocation',    'sectionProgress',
//    'bearing',            'speed',
//    'sections',           'osrmRoute'

@Entity()
export class CalculatedTrip {
	@PrimaryColumn()
	@Index()
	id: string;

	@Column()
	name: string;

	@Column()
	stopTimes: string;

	@Column()
	firstDepartureTime: string;

	@Column()
	lastDepartureTime: string;

	@Column()
	@Index()
	sectionLocation: any;

	@Column()
	bearing: string;

	@Column()
	sections: any;

	@Column()
	route: any;

	@Column()
	sectionProgress: number;

	@Column()
	speed: number;

	@Column()
	osrmRoute: any;
}
