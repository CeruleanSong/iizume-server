import { Models } from "../../../..//server";

const latest = async (data: string, { source, page = 1 }) => {

	const userData = { data, key: { source, page: +page } };
	const list = new Models.Latest(userData);

	await list.save().then(async (e: any) => {
		//
	}).catch((err) => {
		// do nothing
	});
};

const manga = async (data: string, { source, page = 1 }) => {

	const userData = { data, key: { source, page: +page } };
	const list = new Models.Latest(userData);

	await list.save().then(async (e: any) => {
		//
	}).catch((err) => {
		// do nothing
	});
};

const chapter = async (data: string, { source, man, chap = 1 }) => {

	const userData = { data, key: { source, manga: man, chapter: +chap } };
	const list = new Models.Chapter(userData);

	await list.save().then(async (e: any) => {
		//
	}).catch((err) => {
		// do nothing
	});
};

const cache = {
	latest,
	chapter,
};

const find = () => {
	//

	// await Models.Latest.findOne({ key: { source: req.source, page: req.page } },
	// 	async (err, res) => {
	// 		data = await res;
	// });
};

export {
	find,
	cache,
};