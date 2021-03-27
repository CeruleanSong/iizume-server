export interface Job {
	id: string;

	job_id: string;

	target: string;

	type: JOB_TYPE;

	status: JOB_STATUS;

	create_time: Date;

	queue_time: Date;

	start_time: Date;

	end_time: Date;
}

export interface CompletedJob {
	job?: Job;
	success: boolean;
}

export enum JOB_TYPE {
	CACHE_MANGA = 'CACHE_MANGA',
	CACHE_CHAPTER_LIST = 'CACHE_CHAPTER_LIST',
	CACHE_PAGE_LIST = 'CACHE_PAGE_LIST',
	CACHE_HOT = 'CACHE_HOT',
	CACHE_LATEST = 'CACHE_LATEST',
	CACHE_ALL = 'CACHE_ALL'
}

export enum JOB_STATUS {
	QUEUED = 'QUEUED',
	STARTED = 'STARTED',
	COMPLETED = 'COMPLETED',
	ERROR = 'ERROR'
}
