import { Entity, Column, PrimaryColumn, Index } from 'typeorm';

@Entity()
export class PositionStatus {
	@PrimaryColumn()
	@Index()
	key: string;

	@Column({ default: null })
	lastStatus?: string;
}
