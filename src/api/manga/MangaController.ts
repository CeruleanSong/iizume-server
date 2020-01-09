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
import Scrapers from "../../scripts/core/source/Scrapers";
import { Models } from '../../server';

const router: Router = new Router();

const errInvalidSource = 'Source is invalid';

router.post("/list", async (ctx: ParameterizedContext) => {
	ctx.body = Scrapers;
	console.log(ctx.body);
});

router.post("/latest", async (ctx: ParameterizedContext) => {
	const req = ctx.request.body ? ctx.request.body : null;

	if(!req.source || !Scrapers[req.source]) { ctx.throw(401, errInvalidSource); }

	ctx.body = await Scrapers[req.source].operations.latest(req.page);
	ctx.toJSON();
});

router.post("/manga", async (ctx: any) => {
	const req = ctx.request.body ? ctx.request.body : null;

	if(!req.source || !Scrapers[req.source]) { ctx.throw(401, errInvalidSource); }

	const list = await Scrapers[req.source].operations.latest(req.page);
	ctx.body = await Scrapers[req.source].operations.manga(list[0].uri);
	ctx.toJSON();
});

router.post("/chapter", async (ctx: any) => {
	const req = ctx.request.body ? ctx.request.body : null;

	if(!req.source || !Scrapers[req.source]) { ctx.throw(401, errInvalidSource); }

	const list = await Scrapers[req.source].operations.latest();
	const chapter = await Scrapers[req.source].operations.manga(list[0].uri);
	ctx.body = await Scrapers[req.source].operations.chapter(chapter.chapters[0].uri);
	ctx.toJSON();
});

router.post("/hot", async (ctx: any) => {
	const user: string = ctx.request.authToken.email;

	await Models.User.find({ email: user }, { _id: 0, password: 0, created: 0 }).then((res: any[]) => {
		ctx.body = res;
	});
});

const MangaController: Router = router;

export default MangaController;