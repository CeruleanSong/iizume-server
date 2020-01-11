/**
 * Scrapers.ts
 * - Collects and exports all scrapers in program.
 * Notes:
 * - N/A
 * Created 20-01-09
 * @author Elias Mawa <elias@emawa.io>
 */

import fs from "fs";
import path from "path";
import Scraper from "./Scraper";

const Scrapers: Scraper[] = Object();

fs.readdir(path.join(__dirname, "./scrapers/"), (folderErr, modules) => {
	modules.forEach((module) => {
		const item: Scraper = require(path.join(__dirname, `./scrapers/${module}`)).default;
		// Scrapers[item.name] = item;
		Scrapers[item.root] = item;
	});
});

const exists = (link: string) => {
	const regex = /[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+/;
	const found = regex.exec(link);

	if(found) {
		return found[0];
	}

	return null;
};

const manga = (link: string) => {
	//
};

const chapter = (link: string) => {
	//
};

const hot = (link: string) => {
	//
};

const latest = (link: string) => {
	//
};

const search = (link: string) => {
	//
};

export {
	exists,
	manga,
	chapter,
	hot,
	latest,
	search,
};

export default Scrapers;
