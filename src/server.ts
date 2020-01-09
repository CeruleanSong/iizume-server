/**
 * server.ts
 * Entrypoint for server.
 * Notes:
 * - N/A
 * @author Elias Mawa <elias@emawa.io>
 * Created 19-22-12
 */

import cors from '@koa/cors';
import Koa from 'koa';
import BodyParser from 'koa-bodyparser';
import Router from 'koa-router';
import mongoose from 'mongoose';
import config from "../res/config.json";
import Api from "./api";
import Authenticate from "./middleware/authenticate";
import Cookies from "./middleware/cookies";
import Model from "./model";

/*****************************
 * setup
 *****************************/

const app: Koa = new Koa();
const router: Router = new Router();

/*****************************
 * database
 *****************************/

mongoose.connect(config.db.url, { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
	console.log(`mongodb connected`, err);
});

mongoose.model(`User`, Model.User);

const Models = mongoose.models;

/*****************************
 * cors
 *****************************/

const whitelist = config.whitelist;

function checkOriginAgainstWhitelist(ctx: any) {
	const requestOrigin = ctx.accept.headers.origin;
	if (!whitelist.includes(requestOrigin)) {
		return ctx.throw(`🙈 ${requestOrigin} is not a valid origin`);
	}
	return requestOrigin;
}

/*****************************
 * middleware
 *****************************/

app.use(BodyParser());
app.use(cors({
	origin: checkOriginAgainstWhitelist,
	credentials: true,
	allowMethods: [ 'post', 'get' ],
}));

/*****************************
 * sessions
 *****************************/

/*****************************
 * auth
 *****************************/

/*****************************
 * routes
 *****************************/

router.use("/api/user", Authenticate, Cookies, Api.User.UserController.routes());
router.use("/api/auth", Cookies, Api.Authentication.routes());

app.use(router.routes());

/*****************************
 * fin
 *****************************/

app.listen(config.port, () => {
	console.log(`Server listening on port: http://localhost:${config.port}`);});

export {
	mongoose,
	Models,
};