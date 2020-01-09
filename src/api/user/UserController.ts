/**
 * UserController.ts
 * Route for users.
 * Notes:
 * - N/A
 * @author Elias Mawa <elias@emawa.io>
 * Created by Elias Mawa on 19-22-12
 */

import { ParameterizedContext } from "koa";
import Router from 'koa-router';
import { Models } from '../../server';

const router: Router = new Router();

router.post("/all", async (ctx: ParameterizedContext) => {
	await Models.User.find({}, { _id: 0, password: 0, created: 0, email: 0 }).then((res: any[]) => {
		ctx.body = res;
		console.log(res);
	});
});

router.post("/profile", async (ctx: any) => {
	const user: string = ctx.request.authToken.email;

	await Models.User.find({ email: user }, { _id: 0, password: 0, created: 0 }).then((res: any[]) => {
		ctx.body = res;
	});
});

const UserController: Router = router;

export default UserController;