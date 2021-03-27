import { Column, CreateDateColumn, Entity, Index, ObjectIdColumn } from 'typeorm';

@Entity()
@Index([ 'created' ])
@Index([ 'manga_id', 'created' ])
export default class TimeStamp {
	@ObjectIdColumn()
	id!: number;

	@Column({ type: 'varchar', length: 16, nullable: false })
	manga_id!: string;

	@CreateDateColumn()
	created!: Date;

	/** RELATIONS */
}

