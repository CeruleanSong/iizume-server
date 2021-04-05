import { getConnection } from 'typeorm';
import path from 'path';
import { uid } from 'uid/secure';
import { exec, spawn } from 'child_process';

import { JOB_TYPE } from './Job';
import { SourceModule } from './';
import { SourceModuleConfig } from './SourceModule';
import { ChapterModel, MangaModel, SourceModel } from '../../../model/mariadb';
import { save_chapter_list, save_manga, save_manga_list, save_page_list } from './SourceParser';

const ModuleList: { [module: string]: SourceModule } = {};

export const load_modules = () => {
	const mariadb = getConnection('mariadb');
	const source_repo = mariadb.manager.getRepository(SourceModel);
	exec('ls ./module/source_*.rb', (err, stdout) => {
		stdout.split('\n').forEach(async (file) => {
			if(file.length > 0) {
				const title = path.basename(file).split('.')[0].split('_')[1];
				const config_path = path.basename(file).split('.')[0];
				const module_path = path.join('../../../../', `./module/${config_path}.json`);
				const s_config: SourceModuleConfig = (await import(module_path)).default;
				let source = await source_repo.findOne({ where: { title: title } });
				
				if(source) {
					source = {
						...source,
						...s_config
					};
					source_repo.update({ source_id: source.source_id }, source);
				} else {
					source = {
						...new SourceModel(),
						...s_config,
						source_id: uid(16)
					};
					source_repo.save(source);
				}
				
				const cache_manga = async (manga: MangaModel): Promise<boolean> => {
					return await new Promise((resolve) => {
						let output = '';
						const cp = spawn('ruby', [
							'./module/execute_module.rb',
							title,
							JOB_TYPE.CACHE_MANGA,
							manga.origin
						]);

						cp.stdout.on('data', (data) => {
							output+=data;
						});

						cp.on('error', () => {
							resolve(false);
						});

						cp.on('close', async (code) => {
							try {
								const data = JSON.parse(output);
								if(code === 0 && source) {
									if(await save_manga(manga.manga_id, data)) {
										resolve(true);
									} else {
										resolve(false);
									}
								} else {
									resolve(true);
								}
							} catch {
								resolve(false);
							}
						});
					});
				};

				const cache_chapter_list = async (manga: MangaModel): Promise<boolean> => {
					return await new Promise((resolve) => {
						let output = '';
						const cp = spawn('ruby', [
							'./module/execute_module.rb',
							title,
							JOB_TYPE.CACHE_CHAPTER_LIST,
							manga.origin
						]);

						cp.stdout.on('data', (data) => {
							output+=data;
						});

						cp.on('error', () => {
							resolve(false);
						});

						cp.on('close', async (code) => {
							try {
								const data = JSON.parse(output);
								if(code === 0 && source) {
									if(await save_chapter_list(manga.manga_id, data)) {
										resolve(true);
									} else {
										resolve(false);
									}
								} else {
									resolve(true);
								}
							} catch {
								resolve(false);
							}
						});
					});
				};

				const cache_page_list = async (chapter: ChapterModel): Promise<boolean> => {
					return await new Promise((resolve) => {
						let output = '';
						const cp = spawn('ruby', [
							'./module/execute_module.rb',
							title,
							JOB_TYPE.CACHE_PAGE_LIST,
							chapter.origin
						]);

						cp.stdout.on('data', (data) => {
							output+=data;
						});

						cp.on('error', () => {
							resolve(false);
						});

						cp.on('close', async (code) => {
							try {
								const data = JSON.parse(output);
								if(code === 0 && source) {
									if(await save_page_list(chapter.chapter_id, data)) {
										resolve(true);
									} else {
										resolve(false);
									}
								} else {
									resolve(true);
								}
							} catch {
								resolve(false);
							}
						});
					});
				};

				const cache_hot = async (): Promise<boolean> => {
					return await new Promise((resolve) => {
						let output = '';
						const cp = spawn('ruby', [ './module/execute_module.rb', title, JOB_TYPE.CACHE_HOT ]);

						cp.stdout.on('data', (data) => {
							output+=data;
						});

						cp.on('error', () => {
							resolve(false);
						});

						cp.on('close', async (code) => {
							try {
								const data = JSON.parse(output);
								if(code === 0 && source) {
									if(await save_manga_list(source.source_id, data)) {
										resolve(true);
									} else {
										resolve(false);
									}
								} else {
									resolve(true);
								}
							} catch {
								resolve(false);
							}
						});
					});
				};

				const cache_latest = async (): Promise<boolean> => {
					return await new Promise((resolve) => {
						let output = '';
						const cp = spawn('ruby', [ './module/execute_module.rb', title, JOB_TYPE.CACHE_LATEST ]);

						cp.stdout.on('data', (data) => {
							output+=data;
						});

						cp.on('error', () => {
							resolve(false);
						});

						cp.on('close', async (code) => {
							try {
								const data = JSON.parse(output);
								if(code === 0 && source) {
									if(await save_manga_list(source.source_id, data)) {
										resolve(true);
									} else {
										resolve(false);
									}
								} else {
									resolve(true);
								}
							} catch {
								resolve(false);
							}
						});
					});
				};

				const cache_all = async (): Promise<boolean> => {
					return await new Promise((resolve) => {
						let output = '';
						const cp = spawn('ruby', [ './module/execute_module.rb', title, JOB_TYPE.CACHE_ALL ]);

						cp.stdout.on('data', (data) => {
							output+=data;
						});

						cp.on('error', () => {
							resolve(false);
						});

						cp.on('close', async (code) => {
							try {
								const data = JSON.parse(output);
								if(code === 0 && source) {
									if(await save_manga_list(source.source_id, data)) {
										resolve(true);
									} else {
										resolve(false);
									}
								} else {
									resolve(true);
								}
							} catch {
								resolve(false);
							}
						});
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