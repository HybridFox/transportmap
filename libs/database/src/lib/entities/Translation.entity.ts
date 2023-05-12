import { Entity, Column, PrimaryGeneratedColumn, Index, ManyToOne, JoinColumn } from 'typeorm';

import { Stop } from './Stop.entity';

@Entity()
export class Translation {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	@Index()
	translationKey: string;

	@Column()
	@Index()
	language: string;

	@Column()
	@Index()
	importId: string;

	@Column()
	translation: string;

	@ManyToOne(() => Stop, (stop) => stop.id, { createForeignKeyConstraints: false })
	@JoinColumn({ name: 'translationKey', referencedColumnName: 'name' })
	stop: any;
}
