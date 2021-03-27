import { Column, CreateDateColumn, Entity, Index, JoinColumn, OneToMany, PrimaryGeneratedColumn,UpdateDateColumn } from 'typeorm';

import { ChapterModel } from '.';

@Entity()
@Index([ 'origin', 'page_number' ])
@Index([ 'page_id', 'chapter_id' ])
@Index([ 'page_id', 'chapter_id', 'page_number' ])
export default class Page {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ type: 'varchar', length: 16, nullable: false, unique: true })
	page_id!: string;

	@Column({ type: 'varchar', length: 16, nullable: false })
	chapter_id!: string;

	@Column({ type: 'varchar', length: 512, nullable: false })
	origin!: string;

	@Column({ type: 'varchar', length: 512, nullable: false })
	image_link!: string;

	@Column({ type: 'smallint', nullable: false })
	page_number!: string;

	@CreateDateColumn()
	create_date!: Date;

	@UpdateDateColumn()
	update_date!: Date;

	/** RELATIONS */
	
    @OneToMany(() => ChapterModel, chapter => chapter.chapter_id)
	@JoinColumn({ referencedColumnName: 'chapter_id' })
	chapter!: ChapterModel;
}