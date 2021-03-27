import { exec } from 'child_process';
import path from 'path';
import { uid } from 'uid/secure';
import { Between, getConnection } from 'typeorm';

import { JOB_TYPE } from '../../../lib/job/Job';
import { SourceModuleConfig } from './SourceModule';
import { Chapter, Manga, SourceModule } from './';
import { ChapterModel, MangaModel, MangaSourceModel, SourceModel } from '../../../model/mysql';

const ModuleList: { [module: string]: SourceModule } = {};

export const load_modules = () => {
	const mysql = getConnection('mysql');
	const chapter_repo = mysql.manager.getRepository(ChapterModel);
	const manga_repo = mysql.manager.getRepository(MangaModel);
	const source_repo = mysql.manager.getRepository(SourceModel);

	exec('ls ./module/source_*.rb', (err, stdout) => {
		stdout.split('\n').forEach(async (file) => {
			if(file.length > 0) {
				const title = path.basename(file).split('.')[0].split('_')[1];
				const config_name = path.basename(file).split('.')[0];
				const module_path = path.join('../../../../', `./module/${config_name}.json`);
				
				let source = await source_repo.findOne({ where: { title: title } });
				const s_config: SourceModuleConfig = (await import(module_path)).default;
				
				if(source) {
					source.origin = s_config.origin;
					source.display_title = s_config.display_title;
					source.title = s_config.title;
					source.enabled = s_config.enabled;
					source_repo.update({ source_id: source.source_id }, source);
				} else {
					source = new SourceModel();
					source.source_id = uid(16);
					source.origin = s_config.origin;
					source.display_title = s_config.display_title;
					source.title = s_config.title;
					source.enabled = s_config.enabled;
					source_repo.save(source);
				}
				
				const cache_manga = (_manga: Manga | Manga[]): Promise<boolean> => {
					return new Promise((_res) => {
						_res(false);
					});
				};

				const cache_chapter_list = (_manga: Manga | Manga[]): Promise<boolean> => {
					return new Promise((_res) => {
						_res(false);
					});
				};

				const cache_page_list = (_chapter: Chapter | Chapter[]): Promise<boolean> => {
					return new Promise((_res) => {
						_res(false);
					});
				};

				const cache_hot = (): Promise<boolean> => {
					return new Promise((_res) => {
						_res(false);
					});
				};

				const cache_latest = async (): Promise<boolean> => {
					return await new Promise((_res) => {
						exec(`ruby ./module/execute_module.rb ${title} ${JOB_TYPE.CACHE_LATEST}`,
							async (err, stdout, stderr) => {
								if(stderr || !source) {
									_res(false);
								} else {
									const data = JSON.parse(stdout);

									const manga_source_list: MangaSourceModel[] = [];

									const manga_list: MangaModel[] = [];
									const chapter_list: ChapterModel[] = [];

									const update_manga_list: MangaModel[] = [];
									const update_chapter_list: ChapterModel[] = [];

									for(const i in data) {
										const db_manga = await manga_repo
											.findOne({ origin: data[i].origin });
										const manga_id = db_manga ? db_manga.manga_id : uid(16);
										
										if(!db_manga) {
											const new_manga: MangaModel = {
												...new MangaModel(),
												...data[i],
												manga_id
											};

											manga_list.push(new_manga);
											const new_manga_source = new MangaSourceModel();
											new_manga_source.manga_id = manga_id;
											new_manga_source.source_id = source.source_id;
											manga_source_list.push(new_manga_source);
										} else {
											const new_manga: MangaModel = {
												...db_manga,
												...data[i]
											};
											update_manga_list.push(new_manga);
										}

										for(const j in data[i].chapters) {
											const chapter = data[i].chapters[j];
											const db_chapter = await chapter_repo.findOne({
												chapter_number: Between(
													chapter.chapter_number-0.001, 
													chapter.chapter_number+0.001
												) 
											});
											if(!db_chapter) {
												const new_chapter: ChapterModel = {
													...new ChapterModel(),
													...chapter,
													chapter_id: uid(16),
													manga_id
												};
												chapter_list.push(new_chapter);
											} else {
												const new_chapter: ChapterModel = {
													...db_chapter,
													...chapter[j]
												};
												update_chapter_list.push(new_chapter);
											}
										}
									}

									await mysql.transaction(async (transaction) => {
										await transaction.insert(MangaModel, manga_list);
										await transaction.insert(ChapterModel, chapter_list);
										await transaction.insert(MangaSourceModel, manga_source_list);
									});

									// console.log(manga_list.length);
									// console.log(chapter_list.length);
									_res(true);
								}
							});
					});
				};

				const cache_all = (): Promise<boolean> => {
					return new Promise((_res) => {
						_res(false);
					});
				};

				const loaded_module: SourceModule = {
					...s_config,
					cache_manga,
					cache_chapter_list,
					cache_page_list,
					cache_hot,
					cache_latest,
					cache_all
				};

				ModuleList[title] = loaded_module;
			}
		});
	});
};
	
export default ModuleList;