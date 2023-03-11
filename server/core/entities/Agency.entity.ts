import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class Agency {
	@PrimaryColumn()
	id: string;

	@Column()
	name: string;

	@Column()
	url: string;

	@Column()
	timezone: string;

	@Column({ nullable: true })
	language: string;

	@Column({ nullable: true })
	phoneNumber: string;
}
