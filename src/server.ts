import Body from 'koa-body';
import CORS from '@koa/cors';
import Koa from 'koa';
import KoaJSON from 'koa-json';
import Router from 'koa-router';
import websockify from 'koa-websocket';

import { createConnection } from 'typeorm';
import { load_modules } from './lib/core/source/ModuleList';
import { Api, WS } from './controller';
import { ChapterModel, MangaModel, MangaSourceModel, MangaTagModel, PageModel,
	SourceModel, TagModel } from './model/mariadb';
import { JobModel, TimeStampModel } from './model/mongo';

import config from '../config/config.json';

/************************************************
 * setup
 ************************************************/

const koaApp: Koa = new Koa();

const wsOptions = {};
const app = websockify(koaApp as any, wsOptions);

const router: Router = new Router();
const socket_router = new Router();

/************************************************
 * database
 ************************************************/

/**** mongo *****/

(async () => {
	createConnection({
		type: 'mongodb',
		name: 'mongo',
		host: config.db.mongo.url,
		port: config.db.mongo.port,
		username: config.db.mongo.username,
		password: config.db.mongo.password,
		database: config.db.mongo.schema,
		entities: [
			JobModel,
			TimeStampModel
		],
		useUnifiedTopology: true,
		authSource: config.db.mongo.authSource,
		synchronize: config.db.synchronize
	}).then((connection) => {
		(app.context as any).mongo = connection;
		// eslint-disable-next-line no-console
		console.log('connected to database: mongodb');
	}).catch((error) => {
		// eslint-disable-next-line no-console
		console.log(error);
	});
})();

/**** mariadb *****/

(async () => {
	createConnection({
		type: 'mariadb',
		name: 'mariadb',
		host: config.db.mariadb.url,
		port: config.db.mariadb.port,
		username: config.db.mariadb.username,
		password: config.db.mariadb.password,
		database: config.db.mariadb.schema,
		entities: [
			ChapterModel,
			MangaSourceModel,
			MangaTagModel,
			MangaModel,
			PageModel,
			SourceModel,
			TagModel
		],
		synchronize: config.db.synchronize
	}).then((connection) => {
		(app.context as any).mariadb = connection;
		// eslint-disable-next-line no-console
		console.log('connected to database: mariadb');
		load_modules();
	}).catch((error) => {
		// eslint-disable-next-line no-console
		console.log(error);
	});
})();

/************************************************
 * services
 ************************************************/

//! TODO

/************************************************
 * middleware
 ************************************************/

app.use(CORS({
	origin: '*',
	credentials: true
}));

app.use(KoaJSON({ pretty: false, param: 'pretty' }));

app.use(Body({
	multipart: true,
	urlencoded: true
}));

/************************************************
 * routes
 ************************************************/

{ /* HTTP */

	{ /* api */
		const api: Router = new Router();

		api.use([
			'/job',
			'/j'
		],
		Api.JobController.routes());

		api.use([
			'/manga',
			'/m'
		],
		Api.MangaController.routes());
		
		api.use([
			'/chapter',
			'/c'
		],
		Api.ChapterController.routes());
		
		api.use([
			'/source',
			'/sc'
		],
		Api.SourceController.routes());

		api.use([
			'/search',
			'/s'
		],
		Api.SearchController.routes());

		router.use('/api', api.routes());
	}

	app.use(router.routes());
}

{ /* WEBSOCKET */

	{
		socket_router.use([
			'/'
		],
		WS.StatusController.routes());
	}

	app.ws.use(socket_router.routes() as any);
}

/************************************************
 * ANCHOR start server
 ************************************************/

app.listen(config.port, () => {
	// eslint-disable-next-line no-console
	console.log(`Server listening: http://localhost:${config.port}`);
});

