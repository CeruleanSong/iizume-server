import { Connection } from 'typeorm';
import { ParameterizedContext } from 'koa';
import Router from 'koa-router';

import { HttpStatus } from '../../lib/types';
import { JobModel } from '../../model/mongo';

const router: Router = new Router();

/************************************************
 * ANCHOR routes
 ************************************************/

router.get([ '/:job_id' ], async (ctx: ParameterizedContext) => {
	const db: Connection = ctx.mongo;
	const job_repo = db.getRepository(JobModel);
	const job = await job_repo.findOne({ job_id: ctx.params.job_id });
	
	if(job) {
		ctx.body = {
			job: job
		};
	} else {
		ctx.status = HttpStatus.CLIENT_ERROR.NOT_FOUND.status;
		ctx.body = HttpStatus.CLIENT_ERROR.NOT_FOUND.message;
	}
});

const Controller: Router = router;

export default Controller;