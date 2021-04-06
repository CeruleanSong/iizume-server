import { Connection } from 'typeorm';
import { ParameterizedContext } from 'koa';
import Router from 'koa-router';

import { HttpStatus } from '../../lib/types';
import { JOB_TYPE } from '../../lib/core/source/Job';
import { SearchSchema } from '../../schema';

import config from '../../../config/config.json';

const router: Router = new Router();

/************************************************
 * ANCHOR routes
 ************************************************/

const Controller: Router = router;

router.get([ '/latest' ], async (ctx: ParameterizedContext) => {
	const body = ctx.request.body;
	const db: Connection = ctx.mariadb;

	const { value, error } = SearchSchema.validate(body, {
		abortEarly: false,
		errors: { escapeHtml: true }
	});
	if(error) {
		ctx.status = HttpStatus.CLIENT_ERROR.BAD_REQUEST.status;
		ctx.body = { errors: [] };
		error.details.forEach(e => { (ctx.body as any).errors.push(e.message); });
		return;
	} else {
		const manga_list = await db.query(`
			SELECT * FROM
			(SELECT manga.manga_id, manga.cover, manga.title, MAX(chapter.chapter_number) AS chapter_number, chapter.release_date, chapter.update_date FROM manga
			JOIN chapter
			ON manga.manga_id = chapter.manga_id
			group by manga.manga_id) AS T1
			ORDER BY T1.release_date DESC, T1.update_date DESC
			LIMIT ?, ?
		`,[ value.limit*(value.page - 1), value.limit ]);
		ctx.body = {
			manga: manga_list
		};
		if(manga_list) {
			const expire_time = 1000*60*30; // 30 minutes
			const update_time = new Date(manga_list[0].update_date).getTime();
			const current_time = new Date().getTime();
			const form = new URLSearchParams();
			if((current_time - update_time) > expire_time) {
				form.append('type', JOB_TYPE.CACHE_CHAPTER_LIST);
				form.append('target', ctx.params.manga_id);
				const res = await fetch(`${config.job_server.url}:${config.job_server.port}/job`, {
					method: 'post',
					body: form
				});
				ctx.body = {
					job_id: await res.text(),
					manga: manga_list
				};
			}
		} else {
			ctx.status = HttpStatus.CLIENT_ERROR.NOT_FOUND.status;
			ctx.body = HttpStatus.CLIENT_ERROR.NOT_FOUND.message;
		}
	}
});

router.get([ '/latest/:source_id' ], async (ctx: ParameterizedContext) => {
	const body = ctx.request.body;
	const db: Connection = ctx.mariadb;

	const { value, error } = SearchSchema.validate(body, {
		abortEarly: false,
		errors: { escapeHtml: true }
	});
	if(error) {
		ctx.status = HttpStatus.CLIENT_ERROR.BAD_REQUEST.status;
		ctx.body = { errors: [] };
		error.details.forEach(e => { (ctx.body as any).errors.push(e.message); });
		return;
	} else {
		const manga_list = await db.query(`
			SELECT * FROM
			(SELECT manga_source.source_id, manga.manga_id, manga.cover, manga.title, MAX(chapter.chapter_number) AS chapter_number, chapter.release_date, chapter.update_date FROM manga
			JOIN chapter
			ON manga.manga_id = chapter.manga_id
			JOIN manga_source
			ON manga.manga_id = manga_source.manga_id
			group by manga.manga_id) AS T1
			WHERE T1.source_id = ?
			ORDER BY T1.release_date DESC, T1.update_date DESC
			LIMIT ?, ?
		`,[ ctx.params.source_id, value.limit*(value.page - 1), value.limit ]);
		ctx.body = {
			manga: manga_list
		};
		if(manga_list) {
			const expire_time = 1000*60*30; // 30 minutes
			const update_time = new Date(manga_list[0].update_date).getTime();
			const current_time = new Date().getTime();
			const form = new URLSearchParams();
			if((current_time - update_time) > expire_time) {
				form.append('type', JOB_TYPE.CACHE_CHAPTER_LIST);
				form.append('target', ctx.params.manga_id);
				const res = await fetch(`${config.job_server.url}:${config.job_server.port}/job`, {
					method: 'post',
					body: form
				});
				ctx.body = {
					job_id: await res.text(),
					manga: manga_list
				};
			}
		} else {
			ctx.status = HttpStatus.CLIENT_ERROR.NOT_FOUND.status;
			ctx.body = HttpStatus.CLIENT_ERROR.NOT_FOUND.message;
		}
	}
});

export default Controller;