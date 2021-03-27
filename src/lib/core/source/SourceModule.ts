import { Chapter, Manga } from '.';

export interface SourceModuleConfig {
	origin: string;
	title: string;
	display_title: string;
	enabled: boolean;
	favicon?: string;
}

export interface SourceModule extends SourceModuleConfig {
	cache_manga: (manga: Manga | Manga[]) => Promise<boolean>;
	cache_chapter_list: (manga: Manga | Manga[]) => Promise<boolean>;
	cache_page_list: (chapter: Chapter | Chapter[]) => Promise<boolean>;
	cache_hot: () => Promise<boolean>;
	cache_latest: () => Promise<boolean>;
	cache_all: () => Promise<boolean>;
}