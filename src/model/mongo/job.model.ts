import { Column, CreateDateColumn, Entity, Index, ObjectIdColumn } from 'typeorm';

import { JOB_STATUS, JOB_TYPE } from '../../lib/job/Job';

@Entity()
@Index([ 'job_id', 'type' ], { unique: true })
@Index([ 'job_id', 'status' ], { unique: true })
export default class Job {
	@ObjectIdColumn()
	id!: number;

	@Column({ type: 'varchar', length: 16, nullable: false, unique: true })
	job_id!: string;

	@Column({ type: 'varchar', length: 16, nullable: false })
	type!: JOB_TYPE;

	@Column({ type: 'varchar', length: 64, nullable: false })
	target!: string;

	@Column({ type: 'varchar', length: 64, nullable: true })
	status!: JOB_STATUS;

	@CreateDateColumn()
	create_time!: Date;

	@Column({ type: 'datetime', nullable: true })
	queue_time!: Date;

	@Column({ type: 'datetime', nullable: true })
	start_time!: Date;

	@Column({ type: 'datetime', nullable: true })
	end_time!: Date;

	/** RELATIONS */
}