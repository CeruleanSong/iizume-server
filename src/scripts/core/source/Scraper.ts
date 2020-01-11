/**
 * Scraper.ts
 * - Abstract scraper class
 * Notes:
 * - N/A
 * @author Elias Mawa <elias@emawa.io>
 * Created 20-01-08
 */

import { Chapter } from "src/lib/manga/Chapter";
import { ChapterProp, Manga } from "src/lib/manga/Manga";
import { Preview } from "src/lib/manga/Preview";

interface Scraper {
	name: string;
	root: string;
	nsfw: boolean;

	operations: {
		manga: (uri: string) => Promise<Manga>;
		chapter: (uri: string) => Promise<Chapter>;

		latest: (page?: number) => Promise<Preview[]>;
		search: ({ keyword, status, genre, type }: any, page?: number) => Promise<Preview[]>;
	};
}

export default Scraper;