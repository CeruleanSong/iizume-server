import Koa, { ParameterizedContext } from 'koa';
import Queue from 'bee-queue';
import bodyParser from 'koa-bodyparser';
import Router from '@koa/router';
import mysql from 'mysql2';
import { spawn } from 'child_process';
import config from './db/db_config.json'

const router = new Router();
const app = new Koa();
app.use(bodyParser());

const queue = new Queue('job-queue',{
	redis: {
		...config.redis,
	},

});

const db = mysql.createConnection({
	...config.mysql
});

enum JOB_TYPE {
	CACHE_MANGA_CHAPTERS = 'CACHE_MANGA_CHAPTERS',
	CACHE_CHAPTER_PAGES = 'CACHE_CHAPTER_PAGES'
};

const set_queued = (job_id: string) => {
	db.query(
		"\
			UPDATE job\
			SET\
				status = 'QUEUED',\
				queue_time = ?\
			WHERE\
				job_id = ?\
		",
		[ new Date(), job_id ]
	);
};

const set_started = (job_id: string) => {
	db.query(
		"\
			UPDATE job\
			SET\
				status = 'STARTED',\
				start_time = ?\
			WHERE\
				job_id = ?\
		",
		[ new Date(), job_id ]
	);
};

const set_complete = (job_id: string) => {
	db.query(
		"\
			UPDATE job\
			SET\
				status = 'COMPLETE',\
				end_time = ?\
			WHERE\
				job_id = ?\
		",
		[ new Date(), job_id ]
	);
};

const set_error = (job_id: string) => {
	db.query(
		"\
			UPDATE job\
			SET\
				status = 'ERROR',\
				end_time = ?\
			WHERE\
				job_id = ?\
		",
		[ new Date(), job_id ]
	);
};

const cache_manga_chapters = async (payload: any) => {
	return new Promise<any>((res) => {
		set_started(payload.job_id);
		const job_res = spawn('./cron/cache_manga_chapters_id.rb', [ payload.target ]);
		job_res.on('close', (code) => {
			res({
				code,
				payload
			})
		});
	})
};

// const cache_chapter_pages = async (chapter_id: string) => {
// 	return new Promise<number>((res) => {
// 		const job_res = spawn('./cron/cache_manga_chapters_id.rb', [ chapter_id ]);

// 		job_res.on('close', (code) => {
// 			res(code as any)
// 		});
// 	})
// };

queue.process((job: any, done: Queue.DoneCallback<unknown>) => {
	let success: any = -1;
	switch (job.data.type)
	{
		case JOB_TYPE.CACHE_MANGA_CHAPTERS:
			success = cache_manga_chapters(job.data);
			break;
		default:
			break;
	}
	return done(null, success);
});

router.all('/job', async (ctx: ParameterizedContext, next) => {
	const body = ctx.request.body;
	const job = queue.createJob(body);
	
	job.save();
	set_queued(body.job_id);

	job.on('succeeded', async (result) => {
		const payload = await result;
		if(payload.code === 0) {
			set_complete(payload.payload.job_id)
		} else {
			set_error(payload.payload.job_id)
		}
		console.log(`finished job ${job.id}:${payload.code}`);
	});

	ctx.status = 200;
});

app.use(router.routes())
app.listen(3001);