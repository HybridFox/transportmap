import { Entity, Column, PrimaryColumn, Index, OneToMany } from 'typeorm';

import { StopTime } from './StopTime.entity';

@Entity()
export class Stop {
	@PrimaryColumn()
	@Index()
	id: string;

	@Column({ nullable: true })
	code: string;

	@Column()
	@Index()
	importId: string;

	@Column({ nullable: true })
	name: string;

	@Column({ nullable: true })
	description: string;

	@Column('float', { nullable: true })
	latitude: number;

	@Column('float', { nullable: true })
	longitude: number;

	@Column({ nullable: true })
	@Index()
	zoneId: string;

	@Column({ nullable: true })
	url: string;

	@Column({ nullable: true })
	locationType: string;

	@Column({ nullable: true })
	parentStationId: string;

	@Column({ nullable: true })
	platformCode: string;

	@OneToMany(() => StopTime, (stop) => stop.stop, { createForeignKeyConstraints: false })
	stopTimes: StopTime[];
}
