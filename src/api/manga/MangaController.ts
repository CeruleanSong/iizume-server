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
import { cache } from "../../scripts/core/data/cache/ApiCache";
import Scrapers, { exists } from "../../scripts/core/source/Scrapers";
import { Models } from '../../server';

const router: Router = new Router();

const errInvalidSource = 'Source is invalid';

router.all("/sites", async (ctx: ParameterizedContext) => {
	ctx.body = Scrapers;
});

router.all("/latest", async (ctx: ParameterizedContext) => {
	let req = ctx.request.body.source ? ctx.request.body : null;
	if(!req) {
		req = ctx.request.query;
	}

	let source = exists(req.source);

	if(!source) {
		source = req.source;
	}

	if(!source || !Scrapers[source]) { ctx.throw(401, errInvalidSource); }

	ctx.body = await Scrapers[source].operations.latest(req.page);
	// cache.latest(JSON.stringify(ctx.body), req);
	cache.latest(ctx.body, req);
	ctx.toJSON();
});

router.all("/search", async (ctx: any) => {
	let req = ctx.request.body.source ? ctx.request.body : null;
	if(!req) {
		req = ctx.request.query;
	}

	let source = exists(req.source);

	if(!source) {
		source = req.source;
	}

	if(!source || !Scrapers[source]) { ctx.throw(401, errInvalidSource); }

	const result = await Scrapers[source].operations.search(req);
	ctx.body = result;
	ctx.toJSON();
});

router.all("/series", async (ctx: any) => {
	let req = ctx.request.body.source ? ctx.request.body : null;
	if(!req) {
		req = ctx.request.query;
	}

	const source = exists(req.source);

	if(!source || !Scrapers[source]) { ctx.throw(401, errInvalidSource); }

	ctx.body = await Scrapers[source].operations.manga(req.source);
	ctx.toJSON();
});

router.all("/chapter", async (ctx: any) => {
	let req = ctx.request.body.source ? ctx.request.body : null;
	if(!req) {
		req = ctx.request.query;
	}

	const source = exists(req.source);

	if(!source || !Scrapers[source]) { ctx.throw(401, errInvalidSource); }

	const chapter = await Scrapers[source].operations.chapter(req.source);
	ctx.body = chapter;
	cache.chapter(ctx.body, { source, man: chapter.title, chap: chapter.num });
	ctx.toJSON();
});

const MangaController: Router = router;

export default MangaController;