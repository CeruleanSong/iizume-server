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
			await mariadb.transaction(async (transaction) => {
				await transaction.update(MangaModel, {
					manga_id: manga_id
				}, update_payload);
			}).catch(() => {
				return resolve(false);
			});
			return resolve(true);
		})();
	});
};

export const save_chapter_list = async (manga_id: string, chapter_list: ChapterModel[]) => {
	return new Promise<boolean>((resolve) => {
		if(manga_id && chapter_list && chapter_list.length > 0) {
			const mariadb = getConnection('mariadb');
			const chapter_repo = mariadb.manager.getRepository(ChapterModel);

			const chapter_update: ChapterModel[] = [];
			const chapter_insert: ChapterModel[] = [];

			(async () => {
				for(const i in chapter_list) {
					await chapter_repo.findOne({ 
						where: { 
							origin: chapter_list[i].origin
						} 
					}).then(async (db_chapter) => {
						const chapter_id = db_chapter ? db_chapter.chapter_id : uid(16);
						if(db_chapter) {
							const chapter_payload = {
								...chapter_list[i],
								chapter_id: chapter_id,
								manga_id: manga_id
							};
							chapter_update.push(chapter_payload);
						} else {
							const chapter_payload = {
								...new ChapterModel(),
								...chapter_list[i],
								chapter_id: chapter_id,
								manga_id: manga_id
							};
							chapter_insert.push(chapter_payload);
						}
					});
				}
				await mariadb.transaction(async (transaction) => {
					await transaction.insert(ChapterModel, chapter_insert);
					for(const i in chapter_update) {
						await transaction.update(
							ChapterModel,
							{ chapter_id: chapter_update[i].chapter_id }, 
							chapter_update[i]
						);
					}
				}).catch(() => {
					return resolve(false);
				});
				return resolve(true);
			})();
		} else {
			return resolve(false);
		}
	});
};

export const save_page_list = async (chapter_id: string, page_list: PageModel[]) => {
	return new Promise<boolean>((resolve) => {
		if(chapter_id && page_list && page_list.length > 0) {
			const mariadb = getConnection('mariadb');
			const page_repo = mariadb.manager.getRepository(PageModel);

			const page_insert: PageModel[] = [];

			(async () => {
				for(const i in page_list) {
					await page_repo.findOne({ 
						where: { 
							origin: page_list[i].origin
						} 
					}).then(async (db_page) => {
						const page_id = db_page ? db_page.page_id : uid(16);
						if(db_page) {
							// do nothing
						} else {
							const new_page = {
								...new PageModel(),
								...page_list[i],
								chapter_id: chapter_id,
								page_id: page_id

							};
							page_insert.push(new_page);
						}
					});
				}
				await mariadb.transaction(async (transaction) => {
					await transaction.insert(PageModel, page_insert);
				}).catch(() => {
					return resolve(false);
				});
				return resolve(true);
			})();
		} else {
			return resolve(false);
		}
	});
};

export const save_tag_list = async (manga_id: string, tag_list: string[]) => {
	return new Promise<boolean>((resolve) => {
		if(manga_id && tag_list && tag_list.length > 0) {
			const mariadb = getConnection('mariadb');
			const tag_repo = mariadb.manager.getRepository(TagModel);
			const manga_tag_repo = mariadb.manager.getRepository(MangaTagModel);

			const new_tag_insert: TagModel[] = [];
			const new_manga_tag_insert: MangaTagModel[] = [];
			
			(async () => {
				for(const i in tag_list) {
					await tag_repo.findOne({ where: { title: tag_list[i] } })
						.then(async (db_tag) => {
							const tag_id = db_tag ? db_tag.tag_id : uid(16);
							if(db_tag) {
								// do nothing
							} else {
								const new_tag = {
									...new TagModel(),
									tag_id: tag_id,
									title: tag_list[i]
								};
								new_tag_insert.push(new_tag);
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
									const new_manga_tag = {
										...new MangaTagModel(),
										tag_id: tag_id,
										manga_id: manga_id
									};
									new_manga_tag_insert.push(new_manga_tag);
								}
							});
						});
				}
				await mariadb.transaction(async (transaction) => {
					await transaction.save(TagModel, new_tag_insert);
					await transaction.save(MangaTagModel, new_manga_tag_insert);
				}).catch(() => {
					return resolve(false);
				});
				return resolve(true);
			})();
		} else {
			return resolve(false);
		}
	});
};

export const save_manga_list = async (source_id: string, manga_list: MangaModel[]) => {
	return new Promise<boolean>((resolve) => {
		if(source_id && manga_list && manga_list.length > 0) {
			const mariadb = getConnection('mariadb');
			const manga_repo = mariadb.manager.getRepository(MangaModel);

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
								manga_id: manga_id
							};
							manga_insert.push(new_manga);
							const new_manga_source = {
								...new MangaSourceModel(),
								source_id: source_id,
								manga_id: manga_id
							};
							manga_source_insert.push(new_manga_source);
						}
						const new_tags: string[] = (manga_list[i] as any).tags;
						if(new_tags) {
							manga_tag_list.push({
								manga_id: manga_id,
								tags: new_tags
							});
						}
						const new_chapters: ChapterModel[] = (manga_list[i] as any).chapters;
						if(new_chapters) {
							manga_chapter_list.push({
								manga_id: manga_id,
								chapters: new_chapters
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
				}).catch(() => {
					return resolve(false);
				});
				return resolve(true);
			})();
		} else {
			return resolve(false);
		}
	});
};