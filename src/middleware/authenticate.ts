/**
 * authenticate.ts
 * Middleware for validating authorization tokens.
 * Notes:
 * - N/A
 * @author Elias Mawa <elias@emawa.io>
 * Created by Elias Mawa on 19-22-12
 */

import jwt from "jsonwebtoken";
import config from "../../res/config.json";
import { AuthToken } from "../model/json/";
import { Models } from "../server";

const secret = config.crypt.secret;

/**
 * Validates authorization token and user.
 */
export default async (ctx: any, next: any) => {
	let token: string = null;
	
	const authorization = ctx.headers.authorization ? ctx.headers.authorization : null;

	if(authorization != null) {
		token = ctx.headers.authorization.split(' ')[1];
	} else {
		if(ctx.cookies.get("authorization") != null) {
			token = ctx.cookies.get("authorization");
		}
	}

	if(token == null) {
		ctx.throw(403, 'No token.');
	} else {
		try {
			ctx.request.authorization = jwt.verify(token, secret);
			const authorizationToken: AuthToken = ctx.request.authorization;
			let dbTime: number;
			let user: any;

			await Models.User.findOne({ email: authorizationToken.email }, async (err, res) => {
				user = await res;
			});

			if(user == null) {
				ctx.throw(403, "Invalid Token, Unknown User");
			}
			else {
				dbTime = new Date(user.passLastEdit).getTime();

				if(dbTime > authorizationToken.createdOn) {
					ctx.throw(403, "Invalid Token, Password Changed");
				}
				else {
					if(new Date().getTime() > authorizationToken.validUntil) {
						ctx.throw(403, "Invalid Token, Session Expired");
					}
					else {
						// continue
					}
				}
			}
		}
		catch(err) {
			ctx.throw(err.status || 403, err.text);
		}
	}

	await next();
  };