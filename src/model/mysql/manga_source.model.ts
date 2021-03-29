import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { MangaModel , SourceModel } from '.';

@Entity()
@Index([ 'manga_id', 'source_id' ])
export default class MangaSource {
	@PrimaryGeneratedColumn()
	id!: number;
	
	@Column({ type: 'varchar', length: 16, nullable: false, unique: true })
	manga_id!: string;

	@Column({ type: 'varchar', length: 16, nullable: false })
	source_id!: string;

	/** RELATIONS */
	
    @OneToOne(() => MangaModel, manga => manga.manga_id)
	@JoinColumn({ name: 'manga_id', referencedColumnName: 'manga_id'  })
	manga?: MangaModel;

    @ManyToOne(() => SourceModel, source => source.source_id)
	@JoinColumn({ name: 'source_id', referencedColumnName: 'source_id' })
	source?: SourceModel;
}