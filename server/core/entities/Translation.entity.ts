import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

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
	translation: string;
}
