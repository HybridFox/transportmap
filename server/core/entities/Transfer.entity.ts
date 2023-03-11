import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity()
export class Transfer {
	@PrimaryGeneratedColumn('uuid')
	@Index()
	id: string;

	@Column()
	@Index()
	fromStopId: string;

	@Column()
	@Index()
	toStopId: string;

	@Column()
	transferType: string;

	@Column()
	minTransferTime: string;

	@Column({ nullable: true })
	@Index()
	fromTripId: string;

	@Column({ nullable: true })
	@Index()
	toTripId: string;
}
