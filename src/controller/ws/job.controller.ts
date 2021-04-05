import { Connection } from 'typeorm';
import Router from 'koa-router';

import { HttpStatus } from '../../lib/types';
import { JobModel } from '../../model/mongo';

const router: Router = new Router();


/************************************************
 * ANCHOR routes
 ************************************************/

const sleep = (ms: number) => {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
};

router.all('/:job_id', async (ctx: any) => {
	const db: Connection = ctx.mongo;
	const job_repo = db.getRepository(JobModel);

	// eslint-disable-next-line no-constant-condition
	while(true) {
		const job = await job_repo.findOne({ job_id: ctx.params.job_id });
		if(job) {
			const payload = {
				job: job
			};
			ctx.websocket.send(JSON.stringify(payload));
		} else {
			const payload = {
				status: HttpStatus.CLIENT_ERROR.NOT_FOUND.status,
				massage: HttpStatus.CLIENT_ERROR.NOT_FOUND.message
			};
			ctx.websocket.send(JSON.stringify(payload));
			return;
		}
		await sleep(1000);
	}
});

const Controller: Router = router;

export default Controller;