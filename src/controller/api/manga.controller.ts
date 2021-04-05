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
		ctx.body = {
			manga: manga
		};

		const expire_time = 1000*60*60*24*7; // 1 week
		const update_time = new Date(manga.update_date).getTime();
		const current_time = new Date().getTime();
		if(!manga.full_sync || (current_time - update_time) > expire_time) {
			const manga_form = new URLSearchParams();
			manga_form.append('type', JOB_TYPE.CACHE_MANGA);
			manga_form.append('target', ctx.params.manga_id);
			const res = await fetch(`${config.job_server.url}:${config.job_server.port}/job`, {
				method: 'post',
				body: manga_form
			});
			ctx.body = {
				job_id: await res.text(),
				manga: manga
			};
			
			const chapter_form = new URLSearchParams();
			chapter_form.append('type', JOB_TYPE.CACHE_CHAPTER_LIST);
			chapter_form.append('target', ctx.params.manga_id);
			fetch(`${config.job_server.url}:${config.job_server.port}/job`, {
				method: 'post',
				body: chapter_form
			});
		}
	} else {
		ctx.status = HttpStatus.CLIENT_ERROR.NOT_FOUND.status;
		ctx.body = HttpStatus.CLIENT_ERROR.NOT_FOUND.message;
	}
});

router.get([ '/:manga_id/chapters' ], async (ctx: ParameterizedContext) => {
	const db: Connection = ctx.mariadb;
	const manga_repo = db.getRepository(MangaModel);
	const manga = await manga_repo.findOne({ manga_id: ctx.params.manga_id });
	
	if(manga) {
		const chapters = await db.query(
			'SELECT * FROM chapter WHERE manga_id = ?',
			ctx.params.manga_id
		);
		
		if(chapters) {
			ctx.body = {
				chapters: chapters
			};

			const expire_time = 1000*60*60*2; // 2 hours
			const update_time = new Date(chapters[0] ? chapters[0].update_date : 0).getTime();
			const current_time = new Date().getTime();
			if((current_time - update_time) > expire_time) {
				const form = new URLSearchParams();
				form.append('type', JOB_TYPE.CACHE_CHAPTER_LIST);
				form.append('target', ctx.params.manga_id);
				const res = await fetch(`${config.job_server.url}:${config.job_server.port}/job`, {
					method: 'post',
					body: form
				});
				ctx.body = {
					job_id: await res.text(),
					chapters: chapters
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