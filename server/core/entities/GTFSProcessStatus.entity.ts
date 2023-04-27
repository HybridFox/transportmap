import { Entity, Column, PrimaryColumn, Index } from 'typeorm';

@Entity()
export class GTFSProcessStatus {
	@PrimaryColumn()
	@Index()
	key: string;

	@Column({ default: 0 })
	lastRealtimeMessageTimestamp: number;

	@Column({ default: false })
	processingStaticData: boolean;

	@Column({ default: false })
	processingRealtimeData: boolean;
}
