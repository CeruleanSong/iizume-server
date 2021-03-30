import { getConnection } from 'typeorm';
import { uid } from 'uid/secure';

import { ChapterModel, MangaModel, MangaSourceModel, MangaTagModel, PageModel, TagModel } from '../../../model/mariadb';

export const save_manga = async (manga_id: string, manga: MangaModel) => {
	return new Promise<boolean>((resolve) => {
		const mariadb = getConnection('mariadb');
		const update_payload = {
			...new MangaModel(),
			cover: manga.cover,
			title: manga.title,
			author: manga.author,
			artist: manga.artist,
			status_origin: manga.status_origin,
			status_scanlation: manga.status_scanlation,
			type: manga.type,
			description: manga.description,
			full_sync: true,
			release_date: manga.release_date
		};
		(async () => {
			mariadb.transaction(async (transaction) => {
				await transaction.update(MangaModel, {
					manga_id: manga_id
				}, update_payload);
			}).then(() => {
				resolve(true);
			}).catch(() => {
				resolve(false);
			});
		})();
	});
};

export const save_chapter_list = async (manga_id: string, chapter_list: ChapterModel[]) => {
	return new Promise<boolean>((resolve) => {
		if(manga_id && chapter_list.length > 0) {
			const mariadb = getConnection('mariadb');
			const chapter_repo = mariadb.manager.getRepository(ChapterModel);

			const chapter_insert: ChapterModel[] = [];

			(async () => {
				for(const i in chapter_list) {
					await chapter_repo.findOne({ 
						where: { 
							manga_id: manga_id,
							origin: chapter_list[i].origin
						} 
					}).then(async (db_chapter) => {
						const chapter_id = db_chapter ? db_chapter.chapter_id : uid(16);
						if(db_chapter) {
							// do nothing
						} else {
							chapter_insert.push({
								...new ChapterModel(),
								...chapter_list[i],
								chapter_id: chapter_id,
								manga_id: manga_id
							});
						}
					});
				}
				mariadb.transaction(async (transaction) => {
					await transaction.insert(ChapterModel, chapter_insert);
				}).then(() => {
					resolve(true);
				}).catch(() => {
					resolve(false);
				});
			})();
		} else {
			resolve(false);
		}
	});
};

export const save_page_list = async (chapter_id: string, page_list: PageModel[]) => {
	return new Promise<boolean>((resolve) => {
		if(chapter_id && page_list.length > 0) {
			const mariadb = getConnection('mariadb');
			const page_repo = mariadb.manager.getRepository(PageModel);

			const page_insert: PageModel[] = [];

			(async () => {
				for(const i in page_list) {
					await page_repo.findOne({ 
						where: { 
							chapter_id: chapter_id,
							origin: page_list[i].origin
						} 
					}).then(async (db_page) => {
						const page_id = db_page ? db_page.page_id : uid(16);
						if(db_page) {
							// do nothing
						} else {
							page_insert.push({
								...new PageModel(),
								...page_list[i],
								chapter_id: chapter_id,
								page_id: page_id
							});
						}
					});
				}
				mariadb.transaction(async (transaction) => {
					await transaction.insert(PageModel, page_insert);
				}).then(() => {
					resolve(true);
				}).catch(() => {
					resolve(false);
				});
			})();
		} else {
			resolve(false);
		}
	});
};

export const save_tag_list = async (manga_id: string, tag_list: string[]) => {
	return new Promise<boolean>((res) => {
		if(manga_id && tag_list.length > 0) {
			const mariadb = getConnection('mariadb');
			const tag_repo = mariadb.manager.getRepository(TagModel);
			const manga_tag_repo = mariadb.manager.getRepository(MangaTagModel);

			const manga_tag_insert: MangaTagModel[] = [];
			const tag_insert: TagModel[] = [];
			
			(async () => {
				for(const i in tag_list) {
					await tag_repo.findOne({ where: { title: tag_list[i] } })
						.then(async (db_tag) => {
							const tag_id = db_tag ? db_tag.tag_id : uid(16);
							if(db_tag) {
								// do nothing
							} else {
								tag_insert.push({
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
								if(db_manga_tag) {
									// do nothing
								} else {
									manga_tag_insert.push({
										...new MangaTagModel(),
										tag_id: tag_id,
										manga_id: manga_id
									});
								}
							});
						});
				}
				mariadb.transaction(async (transaction) => {
					await transaction.save(MangaTagModel, manga_tag_insert);
					await transaction.save(TagModel, tag_insert);
				}).then(() => {
					res(true);
				}).catch(() => {
					res(false);
				});
			})();
		} else {
			res(false);
		}
	});
};

export const save_manga_list = async (source_id: string, manga_list: MangaModel[]) => {
	return new Promise<boolean>((resolve) => {
		if(source_id && manga_list.length > 0) {
			const mariadb = getConnection('mariadb');
			const manga_repo = mariadb.manager.getRepository(MangaModel);
			const manga_source_repo = mariadb.manager.getRepository(MangaSourceModel);

			const manga_source_insert: MangaSourceModel[] = [];
			const manga_insert: MangaModel[] = [];

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
						if(db_manga) {
							// do nothing
						} else {
							const new_manga = {
								...new MangaModel(),
								...manga_list[i],
								manga_id
							};
							manga_insert.push(new_manga);
							await manga_source_repo.findOne({
								where: {
									manga_id: manga_id
								}
							}).then((db_manga_source) => {
								if(db_manga_source) {
									// do nothing
								} else {
									manga_source_insert.push({
										...new MangaSourceModel(),
										source_id,
										manga_id
									});
								}
							});
						}
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
				await mariadb.transaction(async (transaction) => {
					await transaction.insert(MangaModel, manga_insert);
					await transaction.insert(MangaSourceModel, manga_source_insert);
				}).then(async () => {
					for(const i in manga_chapter_list) {
						await save_chapter_list(manga_chapter_list[i].manga_id, manga_chapter_list[i].chapters);
					}
					for(const i in manga_tag_list) {
						await save_tag_list(manga_tag_list[i].manga_id, manga_tag_list[i].tags);
					}
					resolve(true);
				}).catch(() => {
					resolve(false);
				});
			})();
		} else {
			resolve(false);
		}
	});
};