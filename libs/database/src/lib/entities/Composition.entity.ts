import { Entity, Column, PrimaryColumn, Index } from 'typeorm';

@Entity()
export class Composition {
	@PrimaryColumn()
	@Index()
	id: string;

	@Column()
	composition: any;

	@Column()
	createdAt: Date;
}
