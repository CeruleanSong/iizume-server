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
	thumbnailUrl: string;
	chapters: any[];

	artist: string | null;
	author: string | null;
	publicationStatus: string | null;
	rating: number | null;
	description: string | null;

	tags: string[] | null;
}

interface MangaDeconstruction {
	description?: string;
	artist?: string;
	author?: string;
	publicationStatus?: string;
	rating?: any;
	tags?: string[];
}

/**
 * @param {string} title Title of the chapter
 * @param {string} url Location of the manga
 * @param {string} thumbnailUrl Location of the manga thumbnail
 * @param {string?} artist Drawer for manga
 * @param {string?} author Writer for manga
 * @param {string?} description Long description of manga
 * @param {number?} publicationStatus Satus of publication
 * @param {number?} rating Rating of the manga
 * @param {tags?} tags Array of applicable tags
 * @param {Chapter.Chapter[]?} chapters Link to the page of chapter
 */
const createManga = (title: string, uri: string, thumbnailUrl: string, chapters: any[],
	{ description, artist, author, publicationStatus, rating, tags }: MangaDeconstruction) => {
	const manga: Manga = {
		title,
		uri,
		thumbnailUrl,
		chapters,
		artist: artist ? artist : null,
		author: author ? author : null,
		publicationStatus: publicationStatus ? publicationStatus : null,
		rating: rating ? rating : null,
		description: description ? description : null,
		tags: tags ? tags : null,
	};
	return manga;
};

export {
	Manga,
	createManga,
};
