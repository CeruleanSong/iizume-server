/**
 * Scraper.ts
 * - Abstract scraper class
 * Notes:
 * - N/A
 * @author Elias Mawa <elias@emawa.io>
 * Created 20-01-08
 */

import { Chapter } from "src/lib/manga/Chapter";
import { Manga } from "src/lib/manga/Manga";
import { Preview } from "src/lib/manga/Preview";

interface Scraper {
	name: string;
	root: string;
	nsfw: boolean;

	manga: (preview: Preview) => Promise<Manga>;
	chapter: (url: string) => Promise<Chapter>;
	hot: (page?: number) => Preview[];
	latest: (page?: number) => Promise<Preview[]>;
	search: (name: string) => Preview[];
}

export default Scraper;