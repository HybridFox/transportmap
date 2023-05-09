import { Entity, Column, PrimaryColumn, Index } from 'typeorm';

@Entity()
export class GTFSStaticStatus {
	@PrimaryColumn()
	@Index()
	key: string;

	@Column({ default: false })
	processingStaticData: boolean;
}
