import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn,UpdateDateColumn } from 'typeorm';

@Entity()
@Index([ 'title' ])
@Index([ 'title', 'enabled' ])
export default class Source {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ type: 'varchar', length: 16, nullable: false, unique: true })
	source_id!: string;

	@Column({ type: 'varchar', length: 512, nullable: false, unique: true })
	origin!: string;

	@Column({ type: 'varchar', length: 512, nullable: true })
	display_title!: string;

	@Column({ type: 'varchar', length: 512, nullable: true })
	title!: string;

	@Column({ type: 'boolean', default: false })
	enabled!: boolean;

	@CreateDateColumn()
	created!: Date;

	@UpdateDateColumn()
	updated!: Date;
	
	/** RELATIONS */
}