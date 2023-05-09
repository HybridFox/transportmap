import { Entity, Column, PrimaryColumn, Index } from 'typeorm';

@Entity()
export class GTFSRealtimeStatus {
	@PrimaryColumn()
	@Index()
	key: string;

	@Column({ default: 0 })
	lastRealtimeMessageTimestamp: number;
}
