import { Entity, Column, PrimaryColumn, Index } from 'typeorm';

@Entity()
export class TripRoute {
	@PrimaryColumn()
	@Index()
	key: string;

	@Column('jsonb', { nullable: false, default: [] })
	route: string[];
}
