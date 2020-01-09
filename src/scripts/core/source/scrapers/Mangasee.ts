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
import qs from 'qs';
import { createManga, Manga } from '../../../../lib/manga/Manga';
import { createPreview, Preview } from "../../../../lib/manga/Preview";
import Scraper from "../Scraper";

const latest = async (page: number = 1) => {const req = { page };
	const previewList: Preview[] = [];

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

				const url = scraper.root + urlList[i].attributes.href;

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
					titleString.toString().trim(), imgList[i].attributes.src, mangaUrl, scraper.name));
			}
			else
			{
				break;
			}
		}

	});

	return previewList;
};

const hot = async () => {
	return null;
};

const search = async () => {
	return null;
};

const chapter = async () => {
	return null;
};

const manga = async (uri: string) => {
	let ma: Manga = null;

	await fetch(uri, {
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

			chapterObjectList.push({ title, url: scraper.root + tag.attributes.href });
		}

		ma = createManga(mangaTitle, uri, mangaImg, chapterObjectList, { description, tags: genreList , author: authorList.toString(), artist: authorList.toString(), publicationStatus: status, rating: null });
	});

	return ma;
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