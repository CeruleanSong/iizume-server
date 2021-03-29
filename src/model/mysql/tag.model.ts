import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@Index([ 'title' ])
export default class Tag {
	@PrimaryGeneratedColumn()
	id?: number;

	@Column({ type: 'varchar', length: 16, nullable: false, unique: true })
	tag_id!: string;

	@Column({ type: 'varchar', length: 512, nullable: false, unique: true })
	title!: string;
	
	/** RELATIONS */
}