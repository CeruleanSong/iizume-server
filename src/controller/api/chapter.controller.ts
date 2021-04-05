import { Connection } from 'typeorm';
import { ParameterizedContext } from 'koa';
import Router from 'koa-router';
import fetch from 'node-fetch';

import { ChapterModel } from '../../model/mariadb';
import { HttpStatus } from '../../lib/types';
import { JOB_TYPE } from '../../lib/core/source/Job';
import config from '../../../config/config.json';

// import { Connection } from 'typeorm';

const router: Router = new Router();

/************************************************
 * ANCHOR routes
 ************************************************/

router.get([ '/:chapter_id' ], async (ctx: ParameterizedContext) => {
	const db: Connection = ctx.mariadb;
	const chapter_repo = db.getRepository(ChapterModel);
	const chapter = await chapter_repo.findOne({ chapter_id: ctx.params.chapter_id });
	
	if(chapter) {
		ctx.body = {
			chapter: chapter
		};
	} else {
		ctx.status = HttpStatus.CLIENT_ERROR.NOT_FOUND.status;
		ctx.body = HttpStatus.CLIENT_ERROR.NOT_FOUND.message;
	}
});

router.get([ '/:chapter_id/pages' ], async (ctx: ParameterizedContext) => {
	const db: Connection = ctx.mariadb;
	const chapter_repo = db.getRepository(ChapterModel);
	const chapter = await chapter_repo.findOne({ chapter_id: ctx.params.chapter_id });
	
	if(chapter) {
		const pages = await db.query(
			'SELECT * FROM page WHERE chapter_id = ?',
			ctx.params.chapter_id
		);
		
		if(pages) {
			ctx.body = {
				pages: pages
			};

			const expire_time = 1000*60*60*24*7; // 1 week
			const update_time = new Date(pages[0] ? pages[0].update_date : 0).getTime();
			const current_time = new Date().getTime();
			if((current_time - update_time) > expire_time) {
				const form = new URLSearchParams();
				form.append('type', JOB_TYPE.CACHE_PAGE_LIST);
				form.append('target', ctx.params.chapter_id);
				const res = await fetch(`${config.job_server.url}:${config.job_server.port}/job`, {
					method: 'post',
					body: form
				});
				ctx.body = {
					job_id: await res.text(),
					pages: pages
				};
			}
		} else {
			ctx.status = HttpStatus.CLIENT_ERROR.NOT_FOUND.status;
			ctx.body = HttpStatus.CLIENT_ERROR.NOT_FOUND.message;
		}
	} else {
		ctx.status = HttpStatus.CLIENT_ERROR.NOT_FOUND.status;
		ctx.body = HttpStatus.CLIENT_ERROR.NOT_FOUND.message;
	}
});

const Controller: Router = router;

export default Controller;