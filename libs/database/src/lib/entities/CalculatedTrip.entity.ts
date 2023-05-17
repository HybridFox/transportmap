import { ICalculatedTrip, ILocation, ITripRoute, ITripSection } from '@transportmap/types';
import { Entity, Column, PrimaryColumn, Index } from 'typeorm';

@Entity()
export class CalculatedTrip implements ICalculatedTrip {
	@PrimaryColumn()
	@Index()
	id: string;

	@Column()
	name: string;

	@Column()
	firstDepartureTime: string;

	@Column()
	lastDepartureTime: string;

	@Column()
	sectionLocation: ILocation;

	@Column()
	bearing: number;

	@Column()
	sections: ITripSection[];

	@Column()
	route: ITripRoute;

	@Column()
	sectionProgress: number;

	@Column()
	speed: number;
}
