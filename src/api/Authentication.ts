/**
 * Authentication.ts
 * Route for handling backedn authentication
 * Notes:
 * - N/A
 * @author Elias Mawa <elias@emawa.io>
 * Created by Elias Mawa on 19-22-12
 */

import jwt from 'jsonwebtoken';
import { ParameterizedContext } from "koa";
import Router from 'koa-router';
import config from "../../res/config.json";
import { AuthResponce, AuthToken } from '../model/json/';
import { Models } from '../server';
import bcrypt from "../util/bcrypt";

const router: Router = new Router();

const errorWrongAuthentication = "Incorrect email and/or password.";
const errorNull = "Authorization fields must not be null.";
const errorDuplicate = "Duplicate email address.";

router.post("/login", async (ctx: ParameterizedContext) => {
	let req = null;
	let user: any = null;

	req = ctx.request.body;
	console.log(req);

	if(req.password == null || req.email == null) { ctx.throw(401, errorNull); }

	await Models.User.findOne({ email: req.email }, async (_err, res) => {
		if(res === null)
		{
			// do nothing
		}
		else
		{
			user = res;
		}
	});

	if(user === null)
	{
		ctx.throw(401, errorWrongAuthentication);
	}
	else
	{
		if(await bcrypt.compare(req.password, user.password))
		{
			const currentDate: number = new Date().getTime();
			const expireDate: number = new Date((10*24*60*60*1000) + new Date(currentDate).getTime()).getTime();

			const payload: AuthToken = {
				email: user.email,
				validUntil: expireDate,
				createdOn: currentDate,
			};

			const token = jwt.sign(payload, config.crypt.secret);

			const responce: AuthResponce = {
				user: { email: user.email, username: user.username},
				authorization: token,
			};

			ctx.body = responce;
			ctx.cookies.set('authorization', token, {httpOnly: false});
			ctx.cookies.set('authorized', 'true', {httpOnly: false});
			ctx.cookies.set('email', req.email, {httpOnly: false});
			ctx.cookies.set('username', user.username, { httpOnly: false });
		}
		else
		{
			ctx.throw(401, errorWrongAuthentication);
		}
	}
});

router.post("/register", async (ctx: ParameterizedContext) => {
	const req = ctx.request.body;
	let passwordHash: string = null;

	if(req.password == null || req.email == null || req.username == null) { ctx.throw(401, errorNull); }

	await bcrypt.gen_hash(req.password).then((hash: string) => passwordHash = hash);

	const userData = { username: req.username, email: req.email, password: passwordHash};
	const user = new Models.User(userData);

	await user.save().then(async (e: any) => {
		const currentDate: number = new Date(e.passLastEdit).getTime();
		const expireDate: number = new Date((10*24*60*60*1000) + new Date(currentDate).getTime()).getTime();

		const payload: AuthToken = {
			email: user.email,
			validUntil: expireDate,
			createdOn: currentDate,
		};

		const token = jwt.sign(payload, config.crypt.secret);

		const responce: AuthResponce = {
			user: { email: user.email, username: user.username},
			authorization: token,
		};

		ctx.body = responce;

		ctx.cookies.set('authorization', token, { httpOnly: false });
		ctx.cookies.set('authorized', "true", { httpOnly: false });
		ctx.cookies.set('email', user.email, { httpOnly: false });
		ctx.cookies.set('username', user.username, { httpOnly: false });

	}).catch(() => {
		ctx.throw(401, errorDuplicate);
	});
});

router.post("/logout", async (ctx: ParameterizedContext) => {
	ctx.cookies.set('authorization', null, { httpOnly: false });
	ctx.cookies.set('authorized', null, { httpOnly: false });
	ctx.cookies.set('email', null, { httpOnly: false });
	ctx.cookies.set('username', null, { httpOnly: false });
});

const AuthController: Router = router;

export default AuthController;