import { ParameterizedContext } from 'koa';
import Router from 'koa-router';

// import { Connection } from 'typeorm';

const router: Router = new Router();

/************************************************
 * ANCHOR routes
 ************************************************/

router.get([ '/:manga_id' ], async (ctx: ParameterizedContext) => {
	// const db: Connection = _ctx.mysql;
	ctx.body = 'hello world!';
});

const Controller: Router = router;

export default Controller;