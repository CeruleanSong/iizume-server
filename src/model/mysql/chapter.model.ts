import { Column, CreateDateColumn, Entity, Index, JoinColumn, OneToMany, PrimaryGeneratedColumn,UpdateDateColumn } from 'typeorm';

import { MangaModel } from '.';

@Entity()
@Index([ 'chapter_id', 'manga_id' ])
@Index([ 'chapter_id', 'chapter_number' ])
@Index([ 'chapter_id', 'manga_id', 'chapter_number' ])
export default class Chapter {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ type: 'varchar', length: 16, nullable: false, unique: true })
	chapter_id!: string;

	@Column({ type: 'varchar', length: 16, nullable: false, unique: false })
	manga_id!: string;

	@Column({ type: 'varchar', length: 512, nullable: false, unique: true })
	origin!: string;

	@Column({ type: 'varchar', length: 512, nullable: true })
	title!: string;

	@Column({ type: 'float', precision: 4, nullable: false })
	chapter_number!: string;

	@Column({ type: 'varchar', length: 32, nullable: true })
	scanlator!: string;

	@Column({ type: 'datetime', nullable: true })
	release_date!: string;

	@CreateDateColumn()
	create_date!: Date;

	@UpdateDateColumn()
	update_date!: Date;

	/** RELATIONS */
	
    @OneToMany(() => MangaModel, manga => manga.manga_id)
	@JoinColumn({ referencedColumnName: 'manga_id' })
	manga!: MangaModel;
}