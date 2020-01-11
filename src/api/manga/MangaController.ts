/**
 * MangaController.ts
 * Route for manga scraping.
 * Notes:
 * - N/A
 * @author Elias Mawa <elias@emawa.io>
 * Created by Elias Mawa on 20-01-08
 */

import { ParameterizedContext } from "koa";
import Router from 'koa-router';
import Scrapers, { exists } from "../../scripts/core/source/Scrapers";
import { Models } from '../../server';

const router: Router = new Router();

const errInvalidSource = 'Source is invalid';

router.all("/scrapers", async (ctx: ParameterizedContext) => {
	ctx.body = Scrapers;
});

router.all("/latest", async (ctx: ParameterizedContext) => {
	let req = ctx.request.body ? ctx.request.body : null;
	if(req) {
		req = ctx.request.query;
	}

	if(!req.source || !Scrapers[req.source]) { ctx.throw(401, errInvalidSource); }

	ctx.body = await Scrapers[req.source].operations.latest(req.page);
	ctx.toJSON();
});

router.all("/manga", async (ctx: any) => {
	let req = ctx.request.body ? ctx.request.body : null;
	if(req) {
		req = ctx.request.query;
	}

	const source = exists(req.url);

	if(!source || !Scrapers[source]) { ctx.throw(401, errInvalidSource); }

	ctx.body = await Scrapers[source].operations.manga(req.url);
	ctx.toJSON();
});

router.all("/chapter", async (ctx: any) => {
	let req = ctx.request.body ? ctx.request.body : null;
	if(req) {
		req = ctx.request.query;
	}

	const source = exists(req.url);

	if(!source || !Scrapers[source]) { ctx.throw(401, errInvalidSource); }

	const chapter = await Scrapers[source].operations.chapter(req.url);
	ctx.body = chapter;
	ctx.toJSON();
});

router.all("/hot", async (ctx: any) => {
	let req = ctx.request.body ? ctx.request.body : null;
	if(req) {
		req = ctx.request.query;
	}

	const source = exists(req.url);

	if(!source || !Scrapers[source]) { ctx.throw(401, errInvalidSource); }

	ctx.body = await Scrapers[source].operations.hot(req.page);
	ctx.toJSON();
});

const MangaController: Router = router;

export default MangaController;