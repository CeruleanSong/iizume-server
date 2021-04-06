import { Connection } from 'typeorm';
import { ParameterizedContext } from 'koa';
import Router from 'koa-router';

import { HttpStatus } from '../../lib/types';
import { SourceModel } from '../../model/mariadb';

const router: Router = new Router();

/************************************************
 * ANCHOR routes
 ************************************************/

const Controller: Router = router;

router.get([ '/' ], async (ctx: ParameterizedContext) => {
	const db: Connection = ctx.mariadb;
	const source_repo = db.getRepository(SourceModel);
	const source_list = await source_repo.find();
	
	if(source_list) {
		ctx.body = {
			sources: source_list
		};
	} else {
		ctx.status = HttpStatus.CLIENT_ERROR.NOT_FOUND.status;
		ctx.body = HttpStatus.CLIENT_ERROR.NOT_FOUND.message;
	}
});

router.get([ '/:source_id' ], async (ctx: ParameterizedContext) => {
	const db: Connection = ctx.mariadb;
	const source_repo = db.getRepository(SourceModel);
	const source_list = await source_repo.findOne({ 
		where: [
			{ source_id: ctx.params.source_id },
			{ title: ctx.params.source_id }
		]
	});
	
	if(source_list) {
		ctx.body = {
			source: source_list
		};
	} else {
		ctx.status = HttpStatus.CLIENT_ERROR.NOT_FOUND.status;
		ctx.body = HttpStatus.CLIENT_ERROR.NOT_FOUND.message;
	}
});

export default Controller;