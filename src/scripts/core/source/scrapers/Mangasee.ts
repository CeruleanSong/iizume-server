/**
 * Mangasee.ts
 * mangasee scraper
 * Notes:
 * - N/A
 * @author Elias Mawa <elias@emawa.io>
 * Created 20-01-08
 */

import cheerio from 'cheerio';
import fetch from 'node-fetch';
import { parse } from 'node-html-parser';
import puppeteer from 'puppeteer';
import qs from 'qs';
import { createChapter } from '../../../../lib/manga/Chapter';
import { createManga, Manga } from '../../../../lib/manga/Manga';
import { createPreview, Preview } from "../../../../lib/manga/Preview";
import Scraper from "../Scraper";

const latest = async (page: number = 1) => {
	const req = { page };
	const previewList: Preview[] = [];

	await fetch("https://" + scraper.root + '/home/latest.request.php', {
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

		for (let i = 0;; i++) {
			if (imgList.hasOwnProperty(i) && titleList.hasOwnProperty(i)) {

				/***** get title *****/
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
				/***** get title *****/

				const url = 'https://' +scraper.root + urlList[i].attributes.href;

				const reg = /(read-online\/)(.*)(-chapter.*[0-9]+)(.html)/gm;
				const mangaUrl = url.replace(reg, 'manga/$2');

				// await fetch(url, {
				// 	method: 'post',
				// }).then(async (mangaRes) => {
				// 	const mangaData = await mangaRes.text();
				// 	const mangaRoot: any = parse(mangaData);

					// const reg = RegExp('([0-9]+)(.html)$');
					// const chURL = scraper.root + mangaRoot.querySelectorAll('.list-link')[0].attributes.href;
				// 	mangaUrl = chURL.replace(reg, '$1');
				// });

				previewList.push(createPreview(
					titleString.toString().trim(), imgList[i].attributes.src, mangaUrl, scraper.root));
			}
			else
			{
				break;
			}
		}

	});

	return previewList;
};

const search = async ({ keyword, status, genre, genreFilter, type }: any, page: number = 1) => {

	const req = { keyword, pstatus: status, genre, genreFilter, type };
	const previewList: Preview[] = [];

	await fetch("https://" + scraper.root + '/search/request.php', {
		method: 'post',
		body: qs.stringify(req),
		headers: {
			'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
		},
	}).then(async (res) => {
		const data = await res.text();
		const root: any = parse(data);

		const images = root.querySelectorAll('div.requested div.row div.col-xs-4 img');
		const info = root.querySelectorAll('div.col-xs-8');

		// tslint:disable-next-line: prefer-for-of
		for (let i=0; i<info.length;i++) {
			const img = images[i].attributes.src;
			const title = info[i].querySelector('.resultLink').innerHTML;
			const url = 'https://' + scraper.root + info[i].querySelector('.resultLink').attributes.href;

			const authors = []; // images[i].attributes.src;
			const authorList = info[i].querySelectorAll('p')[0].querySelectorAll('a');
			for(const tag of authorList) {
				//
				if(tag) {
					authors.push(tag.innerHTML);
				}
			}
			previewList.push(createPreview(title, img, url, scraper.root));
		}
	});

	return previewList;
};

const chapter = async (url: string) => {
	const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
	const page = await browser.newPage();
	await page.goto(url);

	const dom = await page.evaluate(() => document.body.innerHTML);
	const pageHtml: any = parse(dom);
	const chapterInfo = pageHtml.querySelectorAll('select.PageSelect')[0].childNodes;
	await browser.close();

	const regex = /(.*\/)([0-9]*)-([0-9]*)(\.png|\.jpg|\.jpeg)$/gm;

	const pageList: any[] = [];

	const imageTag = pageHtml.querySelector('img.CurImage').attributes.src;
	const title = pageHtml.querySelector('a.list-link span.hidden-xs').innerHTML.replace(/\t|\n/g, '');

	let i = 1;
	while(i <= chapterInfo.length) {

		switch (i.toString().length) {
			case 1:
				pageList.push(imageTag.replace(regex, '$1$2-00' + i + '$4'));
				break;
			case 2:
				pageList.push(imageTag.replace(regex, '$1$2-0' + i + '$4'));
				break;
			case 3:
				pageList.push(imageTag.replace(regex, '$1$2-' + i + '$4'));
				break;
		}

		i++;
	}

	const ch = createChapter(+imageTag.replace(regex, '$2'), url, pageList, { title });

	return ch;
};

const manga = async (url: string) => {
	let ma: Manga = null;

	await fetch(url, {
		method: 'post',
	}).then(async (res) => {
		const data = await res.text();
		const root: any = parse(data);

		const mangaTitle = root.querySelector('.SeriesName').innerHTML;
		const mangaImg = root.querySelector('.details p img').attributes.src;

		const info = root.querySelectorAll('.details div.row div');
		const authorList = [];
		const genreList = [];
		let type = '';
		let status = '';
		let description = '';

		/***** get description *****/
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
		/***** get description *****/

		const chapterList = root.querySelectorAll('a.list-group-item');

		const chapterObjectList: any[] = [];
		for (const tag of chapterList) {
			const title = tag.querySelector('.chapterLabel').innerHTML;

			chapterObjectList.push({ title, url: 'https://' + scraper.root + tag.attributes.href });
		}

		ma = createManga(mangaTitle, url, mangaImg, chapterObjectList, { description, tags: genreList , author: authorList.toString(), artist: authorList.toString(), publicationStatus: status, rating: null });
	});

	return ma;
};

const scraper: Scraper = {
	name: 'MangaSee',
	root: 'mangaseeonline.us',
	favicon: 'https://mangaseeonline.us/img/favicon.png',
	nsfw: false,
	operations: {
		search,
		latest,
		chapter,
		manga,
	},
};

export default scraper;