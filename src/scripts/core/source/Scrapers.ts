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
		Scrapers[item.name] = item;
	});
});

export default Scrapers;
