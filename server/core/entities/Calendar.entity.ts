import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity()
export class Calendar {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	@Index()
	serviceId: string;

	@Column()
	@Index()
	agencyId: string;

	@Column()
	@Index()
	monday: number;

	@Column()
	@Index()
	tuesday: number;

	@Column()
	@Index()
	wednesday: number;

	@Column()
	@Index()
	thursday: number;

	@Column()
	@Index()
	friday: number;

	@Column()
	@Index()
	saturday: number;

	@Column()
	@Index()
	sunday: number;

	@Column()
	@Index()
	startDate: number;

	@Column()
	@Index()
	endDate: number;
}
