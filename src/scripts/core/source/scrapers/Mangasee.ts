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
import { createManga } from '../../../../lib/manga/Manga';
import { createPreview, Preview } from "../../../../lib/manga/Preview";
import Scraper from "../Scraper";

const scraper: Scraper = {
	name: 'mangasee',
	root: "https://mangaseeonline.us",
	nsfw: false,
	manga: async (preview: Preview) => {
		let manga: Manga.Manga | null = null;

		await fetch(preview.uri, {
			method: 'post',
		}).then(async (res) => {
			const data = await res.text();
			const root: any = parse(data);

			const mangaLink = root.querySelectorAll('.list-link')[0];

			await fetch(scraper.root + mangaLink.attributes.href, {
				method: 'post',
			}).then(async (mangaPage) => {
				const mangaData = await mangaPage.text();
				const html: any = parse(mangaData);

				const info = html.querySelectorAll('.details div.row div');
				const authorList = [];
				const genreList = [];
				let type = '';
				let status = '';
				let description = '';

				if (info.length === 7) {
					const authors = info[1].querySelectorAll('a');
					for (const tag of authors) {
						authorList.push(tag.innerHTML);
					}

					const genres = info[2].querySelectorAll('a');
					for (const tag of genres) {
						genreList.push(tag.innerHTML);
					}

					type = info[3].querySelectorAll('a')[0].innerHTML;

					const s: string = info[5].querySelectorAll('a')[0].innerHTML;
					status = s.split(' ')[0];

					description = info[6].querySelectorAll('.description')[0].innerHTML;

				} else {

					const authors = info[0].querySelectorAll('a');
					for (const tag of authors) {
						authorList.push(tag.innerHTML);
					}

					const genres = info[1].querySelectorAll('a');
					for (const tag of genres) {
						genreList.push(tag.innerHTML);
					}

					type = info[2].querySelectorAll('a')[0].innerHTML;

					const s: string = info[4].querySelectorAll('a')[0].innerHTML;
					status = s.split(' ')[0];

					description = info[5].querySelectorAll('.description')[0].innerHTML;
				}

				const chapterList = html.querySelectorAll('a.list-group-item');

				const chapterObjectList: any[] = [];
				for (const tag of chapterList) {
					// tslint:disable-next-line: no-string-literal
					let title = '';
					const t = tag.attributes.title.split(' ');

					for(let i=1; i < t.length-3; i++) {
						title += t[i] + ' ';
					}
					title = title.trim();

					chapterObjectList.push({ title, url: tag.attributes.href });
				}

				manga = createManga(preview.title, preview.uri, preview.img, chapterObjectList, { description, tags: genreList , author: authorList.toString(), artist: authorList.toString(), publicationStatus: status, rating: null });
			});
		});

		console.log(manga);

		return manga;
	},
	chapter: async (url: string) => {
		const browser = await puppeteer.launch();
		const page = await browser.newPage();
		await page.goto(scraper.root + url);

		let dom = await page.evaluate(() => document.body.innerHTML);

		let pageHtml: any = parse(dom);

		const chapterInfo = pageHtml.querySelectorAll('select.PageSelect option');

		console.log('length: ' + chapterInfo.length);
		console.log('pages: ' + chapterInfo[0]);

		const regex = RegExp('([0-9]+)(.html)$');

		const pageList: any[] = [];
		let i = 1;
		while(i <= chapterInfo.length) {
			pageList.push(url.replace(regex, `${i}$2`));
			i++;
		}
		console.log(pageList);

		const imageList = [];
		// tslint:disable-next-line: prefer-for-of
		for(let q = 0; q < pageList.length; q++) {
			console.log(q);

			await page.goto(scraper.root + pageList[q]);

			dom = await page.evaluate(() => document.body.innerHTML);
			pageHtml = parse(dom);
			const imageTag = pageHtml.querySelector('img.CurImage');
			imageList.push(imageTag.attributes.src);
		}

		console.log(imageList);

		await browser.close();

		return null;
	},
	hot: (page: number) => {
		return null;
	},
	search: (page: string) => {
		return null;
	},
	latest: async (page: number = 1) => {
		const req = { page };

		const list: Preview[] = [];
		await fetch(scraper.root + '/home/latest.request.php', {
			method: 'post',
			body: qs.stringify(req),
			headers: {
				'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
			},
		}).then(async (res) => {
			const data = await res.text();
			const root: any = parse(data);
			const imgList = root.querySelectorAll('.latestImage img');
			const urlList = root.querySelectorAll('a.latestSeries');
			const titleList = root.querySelectorAll('.latestBox p.clamp2');
			const genreList = root.querySelectorAll('.latestBox div.genreLastest');

			for (let i = 0;; i++) {
				if (imgList.hasOwnProperty(i) && titleList.hasOwnProperty(i)
				&& genreList.hasOwnProperty(i)) {

					/* get title */
					const titleTag = [...titleList[i].childNodes];
					let title: any = [];

					if (titleTag.hasOwnProperty(1)) {
						title = titleTag[1].rawText.split(' '); // if 'HOT' icon is present
					}
					else {
						title = titleList[i].firstChild.rawText.split(' '); // If there is no 'HOT' icon
					}

					// This loop removes 'online for free' that's at the end of all titles
					let titleString = '';
					for (let j = 0; j < title.length - 1; j++) {
						titleString += title[j];
						// tslint:disable-next-line: no-magic-numbers
						if (j < title.length - 2) {
							titleString += ' ';
						}
					}
					/* get title */

					const url = scraper.root + urlList[i].attributes.href;

					list.push(createPreview(
						titleString.toString().trim(), imgList[i].attributes.src, url, scraper.name));
				}
				else
				{
					break;
				}
			}

		});

		return list;
	},
};

export default scraper;