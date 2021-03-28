import { ChapterModel, MangaModel } from 'model/mysql';
export interface SourceModuleConfig {
	origin: string;
	title: string;
	display_title: string;
	enabled: boolean;
	favicon?: string;
}

export interface SourceModule extends SourceModuleConfig {
	cache_manga: (manga: MangaModel) => Promise<boolean>;
	cache_chapter_list: (manga: MangaModel) => Promise<boolean>;
	cache_page_list: (chapter: ChapterModel) => Promise<boolean>;
	cache_hot: () => Promise<boolean>;
	cache_latest: () => Promise<boolean>;
	cache_all: () => Promise<boolean>;
}