import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

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
}
