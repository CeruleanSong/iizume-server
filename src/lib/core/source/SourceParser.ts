import { getConnection } from 'typeorm';
import { uid } from 'uid/secure';
import { ChapterModel, MangaModel, MangaSourceModel, MangaTagModel, PageModel, TagModel } from '../../../model/mysql';

export const save_page_list = async (_chapter_id: string, _page_list: PageModel[]) => {
	return new Promise<boolean>((res) => {
		res(false);
	});
};

export const save_chapter_list = async (_manga_id: string, _chapter_list: ChapterModel[]) => {
	// const chapter_repo = mysql.manager.getRepository(ChapterModel);
	// const manga_repo = mysql.manager.getRepository(MangaModel);
	return new Promise<boolean>((res) => {
		res(false);
	});
};

export const save_tag_list = async (manga_id: string, tag_list: string[]) => {
	return new Promise<boolean>((res) => {
		if(manga_id && tag_list.length > 0) {
			const mysql = getConnection('mysql');
			const tag_repo = mysql.manager.getRepository(TagModel);
			const manga_tag_repo = mysql.manager.getRepository(MangaTagModel);

			const new_tag_list: TagModel[] = [];
			const new_manga_tag_list: MangaTagModel[] = [];
			
			(async () => {
				for(const i in tag_list) {
					await tag_repo.findOne({ where: { title: tag_list[i] } })
						.then(async (db_tag) => {
							const tag_id = db_tag ? db_tag.tag_id : uid(16);
							if(!db_tag) {
								new_tag_list.push({
									...new TagModel(),
									tag_id: tag_id,
									title: tag_list[i]
								});
							}
							await manga_tag_repo.findOne({
								where: {
									tag_id: tag_id,
									manga_id: manga_id
								} 
							}).then((db_manga_tag) => {
								if(!db_manga_tag) {
									new_manga_tag_list.push({
										...new MangaTagModel(),
										tag_id: tag_id,
										manga_id: manga_id
									});
								}
							});
						});
				}
				mysql.transaction(async (transaction) => {
					await transaction.save(TagModel, new_tag_list);
				}).then(() => {
					mysql.transaction(async (transaction) => {
						await transaction.save(MangaTagModel, new_manga_tag_list);
						res(true);
					});
				});
			})();
		} else {
			res(false);
		}
	});
};

export const save_manga_list = async (source_id: string, manga_list: MangaModel[]) => {
	return new Promise<boolean>((res) => {
		if(source_id && manga_list.length > 0) {
			const mysql = getConnection('mysql');
			const manga_repo = mysql.manager.getRepository(MangaModel);
			const manga_source_repo = mysql.manager.getRepository(MangaSourceModel);

			const new_manga_source_list: MangaSourceModel[] = [];
			const new_manga_list: MangaModel[] = [];

			const manga_tag_list: any[] = [];
			const manga_chapter_list: any[] = [];
			
			(async () => {
				for(const i in manga_list) {
					await manga_repo.findOne({
						where: {
							origin: manga_list[i].origin
						}
					}).then(async (db_manga) => {
						const manga_id = db_manga ? db_manga.manga_id : uid(16);
						if(!db_manga) {
							const new_manga = {
								...new MangaModel(),
								...manga_list[i],
								manga_id
							};
							new_manga_list.push(new_manga);
						}
						await manga_source_repo.findOne({
							where: {
								manga_id: manga_id
							}
						}).then((db_manga_source) => {
							if(!db_manga_source) {
								new_manga_source_list.push({
									...new MangaSourceModel(),
									source_id,
									manga_id
								});
							}
						});
						const tags: string[] = (manga_list[i] as any).tags;
						if(tags) {
							manga_tag_list.push({
								manga_id,
								tags
							});
						}
						const chapters: ChapterModel[] = (manga_list[i] as any).chapters;
						if(chapters) {
							manga_chapter_list.push({
								manga_id,
								chapters
							});
						}
					});
				}
				await mysql.transaction(async (transaction) => {
					await transaction.save(MangaModel, new_manga_list, {
						chunk: 500
					});
				}).then(async () => {
					await mysql.transaction(async (transaction) => {
						await transaction.save(MangaSourceModel, new_manga_source_list, {
							chunk: 500
						});
					});
					for(const i in manga_chapter_list) {
						await save_chapter_list(manga_chapter_list[i].manga_id, manga_chapter_list[i].chapters);
					}
					for(const i in manga_tag_list) {
						await save_tag_list(manga_tag_list[i].manga_id, manga_tag_list[i].tags);
					}
					res(true);
				});
			})();
		} else {
			res(false);
		}
	});
};