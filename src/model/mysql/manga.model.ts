import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn,UpdateDateColumn } from 'typeorm';

@Entity()
@Index([ 'origin' ])
@Index([ 'manga_id', 'title' ])
@Index([ 'manga_id', 'origin' ])
export default class Manga {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ type: 'varchar', length: 16, nullable: false, unique: true })
	manga_id!: string;

	@Column({ type: 'varchar', length: 512, nullable: false, unique: true })
	origin!: string;

	@Column({ type: 'varchar', length: 512, nullable: false })
	cover!: string;

	@Column({ type: 'varchar', length: 512, nullable: false })
	title!: string;

	@Column({ type: 'varchar', length: 512, nullable: true })
	author!: string;

	@Column({ type: 'varchar', length: 512, nullable: true })
	artist!: string;

	@Column({ type: 'varchar', length: 32, nullable: true })
	status_origin!: string;

	@Column({ type: 'varchar', length: 32, nullable: true })
	status_scanlation!: string;

	@Column({ type: 'varchar', length: 32, nullable: true })
	type!: string;

	@Column({ type: 'text', nullable: true })
	description!: string;
	
	@Column({ type: 'boolean', default: false })
	full_sync!: boolean;

	@Column({ type: 'datetime', nullable: true })
	release_date!: Date;

	@CreateDateColumn()
	create_date!: Date;

	@UpdateDateColumn()
	update_date!: Date;
	
	/** RELATIONS */
}