import Queue from 'bee-queue';
import Router from '@koa/router';
import bodyParser from 'koa-bodyparser';
import { uid } from 'uid/secure';
import { Connection, createConnection } from 'typeorm';
import Koa, { ParameterizedContext } from 'koa';

import { ChapterModel, MangaModel, MangaSourceModel, MangaTagModel, PageModel,
	SourceModel, TagModel } from './model/mysql';
import { JobModel, TimeStampModel } from './model/mongo';

import { HttpStatus } from './lib/types';
import { JobSchema } from './schema';
import { load_modules } from './lib/core/source/ModuleList';
import { JOB_STATUS, JOB_TYPE } from './lib/job/Job';
import { cache_all, cache_chapter_list, cache_hot, cache_latest, cache_manga,
	cache_page_list } from './lib/job/cache.job';

import config from '../config/config.json';

/************************************************
 * setup
 ************************************************/

const app = new Koa();

const router = new Router();

/************************************************
 * database
 ************************************************/

/**** mongo *****/

(async () => {
	return createConnection({
		type: 'mongodb',
		name: 'mongo',
		host: config.db.mongo.url,
		port: config.db.mongo.port,
		username: config.db.mongo.username,
		password: config.db.mongo.password,
		database: config.db.mongo.schema,
		entities: [
			JobModel,
			TimeStampModel
		],
		useUnifiedTopology: true,
		authSource: config.db.mongo.authSource,
		synchronize: false
	}).then((connection) => {
		(app.context as any).mongo = connection;
		// eslint-disable-next-line no-console
		console.log('connected to database: mongodb');
	}).catch((error) => {
		// eslint-disable-next-line no-console
		console.log(error);
	});
})();

/**** mysql *****/

(async () => {
	createConnection({
		type: 'mysql',
		name: 'mysql',
		host: config.db.mysql.url,
		port: config.db.mysql.port,
		username: config.db.mysql.username,
		password: config.db.mysql.password,
		database: config.db.mysql.schema,
		entities: [
			ChapterModel,
			MangaSourceModel,
			MangaTagModel,
			MangaModel,
			PageModel,
			SourceModel,
			TagModel
		],
		synchronize: false
	}).then((connection) => {
		(app.context as any).mysql = connection;
		// eslint-disable-next-line no-console
		console.log('connected to database: mysql');
		load_modules();
	}).catch((error) => {
		// eslint-disable-next-line no-console
		console.log(error);
	});
})();

/************************************************
 * services
 ************************************************/

const queue = new Queue('job-queue',{
	redis: {
		...config.job_server.redis
	}
});

/************************************************
 * middleware
 ************************************************/

app.use(bodyParser());

/************************************************
 * routes
 ************************************************/

router.all([ '/', '/j', '/job' ], async (ctx: ParameterizedContext) => {
	const mongo: Connection = ctx.mongo;
	
	const { value, error } = JobSchema.validate(ctx.request.body, {
		abortEarly: false,
		errors: { escapeHtml: true }
	});
	if(error) {
		ctx.status = HttpStatus.CLIENT_ERROR.BAD_REQUEST.status;
		ctx.body = { errors: [] };
		error.details.forEach(e => { (ctx.body as any).errors.push(e.message); });
		return;
	} else {
		const job_repo = mongo.getRepository(JobModel);
		const new_job = new JobModel();
		new_job.job_id = uid(16);
		new_job.type = value.type;
		new_job.target = value.target;
		new_job.status = JOB_STATUS.QUEUED;
		new_job.queue_time = new Date();
		await job_repo.save(new_job);
		const job = queue.createJob(new_job);
		job.save();
		
		job.on('succeeded', async (_result) => {
			new_job.status = JOB_STATUS.COMPLETED;
			job_repo.save(new_job);

			// eslint-disable-next-line no-console
			console.log(`finished job ${job.id}`);
		});
	
		job.on('failed', async (_err) => {
			new_job.status = JOB_STATUS.ERROR;
			job_repo.save(new_job);

			// eslint-disable-next-line no-console
			console.log(`Job failed: ${_err}`);
		});
		
		ctx.status = 200;
	}
});

app.use(router.routes());

app.listen(config.job_server.port, () => {
	// eslint-disable-next-line no-console
	console.log(`Server listening: http://localhost:${config.job_server.port}`);
});

/************************************************
 * finished
 ************************************************/

queue.process((payload: any, done: Queue.DoneCallback<unknown>) => {
	switch (payload.data.type)
	{
	case JOB_TYPE.CACHE_MANGA:
		cache_manga(payload.data, done);
		return;
	case JOB_TYPE.CACHE_CHAPTER_LIST:
		cache_chapter_list(payload.data, done);
		return;
	case JOB_TYPE.CACHE_PAGE_LIST:
		cache_page_list(payload.data, done);
		return;
	case JOB_TYPE.CACHE_HOT:
		cache_hot(payload.data, done);
		return;
	case JOB_TYPE.CACHE_LATEST:
		cache_latest(payload.data, done);
		return;
	case JOB_TYPE.CACHE_ALL:
		cache_all(payload.data, done);
		return;
	}
	return done(Error('UNKNOWN_JOB'));
});