import { Connection } from 'typeorm';
import { ParameterizedContext } from 'koa';
import Router from 'koa-router';
import fetch from 'node-fetch';

import { HttpStatus } from '../../lib/types';
import { JOB_TYPE } from '../../lib/core/source/Job';
import { MangaModel } from '../../model/mariadb';
import config from '../../../config/config.json';

// import { Connection } from 'typeorm';

const router: Router = new Router();

/************************************************
 * ANCHOR routes
 ************************************************/

router.get([ '/:manga_id' ], async (ctx: ParameterizedContext) => {
	const db: Connection = ctx.mariadb;
	const manga_repo = db.getRepository(MangaModel);
	const manga = await manga_repo.findOne({ manga_id: ctx.params.manga_id });
	
	if(manga) {
		ctx.body = manga;
		if(!manga.full_sync) {
			const form = new URLSearchParams();
			form.append('type', JOB_TYPE.CACHE_MANGA);
			form.append('target', ctx.params.manga_id);
			fetch(`${config.job_server.url}:${config.job_server.port}/job`, {
				method: 'post',
				body: form
			});
		}
	} else {
		ctx.status = HttpStatus.CLIENT_ERROR.NOT_FOUND.status;
		ctx.body = HttpStatus.CLIENT_ERROR.NOT_FOUND.message;
	}
});

const Controller: Router = router;

export default Controller;