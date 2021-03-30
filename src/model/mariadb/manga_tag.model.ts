import { Entity, Index, JoinColumn, ManyToMany, PrimaryColumn } from 'typeorm';

import { MangaModel, TagModel } from '.';

@Entity()
@Index([ 'manga_id', 'tag_id' ], { unique: true })
export default class MangaTag {
	@PrimaryColumn({ type: 'varchar', length: 16, nullable: false })
	manga_id!: string;
	
	@PrimaryColumn({ type: 'varchar', length: 16, nullable: false })
	tag_id!: string;
	
	/** RELATIONS */

	@ManyToMany(() => MangaModel, manga => manga.manga_id)
	@JoinColumn({ name: 'manga_id', referencedColumnName: 'manga_id'  })
	manga?: MangaModel;

	@ManyToMany(() => TagModel, tag => tag.tag_id)
	@JoinColumn({ name: 'tag_id', referencedColumnName: 'tag_id' })
	tag?: TagModel;
}