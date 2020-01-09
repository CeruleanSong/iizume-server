/**
 * Manga.ts
 * - Functions for creating manga.
 * Notes:
 * - N/A
 * Created 19-04-11
 * @author Elias Mawa <elias@emawa.io>
 */

import { Chapter } from ".";

interface Manga {
	title: string;
	uri: string;
	img: string;
	chapters: string[];

	artist: string | null;
	author: string | null;
	publicationStatus: string | null;
	rating: number | null;
	description: string | null;
	id: string | null;
	tags: string[] | null;
}

interface MangaDeconstruction {
	artist?: string;
	author?: string;
	publicationStatus?: string;
	rating?: any;
	description?: string;
	id?: string;
	tags?: string[];
}

/**
 * @param {string} title Title of the chapter
 * @param {string} uri Location of the manga
 * @param {string} img Location of the manga thumbnail
 * @param {string[]} chapters Location of all chapters
 */
const createManga = (title: string, uri: string, img: string, chapters: string[],
	{ description, artist, author, publicationStatus, rating, id, tags }: MangaDeconstruction) => {
	const manga: Manga = {
		title,
		uri,
		img,
		chapters,
		artist: artist ? artist : null,
		author: author ? author : null,
		publicationStatus: publicationStatus ? publicationStatus : null,
		rating: rating ? rating : null,
		description: description ? description : null,
		id: id ? id : null,
		tags: tags ? tags : null,
	};
	return manga;
};

export {
	Manga,
	createManga,
};