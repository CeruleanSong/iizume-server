/**
 * authenticate.ts
 * Middleware for validating authorization tokens.
 * Notes:
 * - N/A
 * @author Elias Mawa <elias@emawa.io>
 * Created by Elias Mawa on 19-22-12
 */

import jwt from "jsonwebtoken";
import { exists } from "src/scripts/core/source/Scrapers.js";
import config from "../../res/config.json";
import { AuthToken } from "../model/json";
import { Models } from "../server";

const secret = config.crypt.secret;

export default async (ctx: any, next: any) => {
	let req = ctx.request.body.source ? ctx.request.body : null;
	if(!req) {
		req = ctx.request.query;
	}

	let source = exists(req.source);
	if(!source) {
		source = req.source;
	}

	// let data;

	await next();
};