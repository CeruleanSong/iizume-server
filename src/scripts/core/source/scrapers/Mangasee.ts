/**
 * Mangasee.ts
 * mangasee scraper
 * Notes:
 * - N/A
 * @author Elias Mawa <elias@emawa.io>
 * Created 20-01-08
 */

import fetch from 'node-fetch';
import { parse } from 'node-html-parser';
import puppeteer from 'puppeteer';
import qs from 'qs';
import { Manga } from 'src/lib/manga';
import { Chapter, createChapter } from '../../../../lib/manga/Chapter';
import { ChapterProp, createManga } from '../../../../lib/manga/Manga';
import { createPreview, Preview } from "../../../../lib/manga/Preview";
import Scraper from "../Scraper";

const latest = async (page: number = 1) => {
	return null;
};

const hot = async (page: number = 1) => {
	return null;
};

const search = async (query: string) => {
	return null;
};

const chapter = async (ch: ChapterProp) => {
	return null;
};

const manga = async (preview: Preview) => {
	return null;
};

const scraper: Scraper = {
	name: 'mangasee',
	root: "https://mangaseeonline.us",
	nsfw: false,
	operations: {
		hot,
		search,
		latest,
		chapter,
		manga,
	},
};

export default scraper;