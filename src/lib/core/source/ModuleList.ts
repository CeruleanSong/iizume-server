import { exec } from 'child_process';
import { getConnection } from 'typeorm';
import path from 'path';
import { uid } from 'uid/secure';

import { JOB_TYPE } from '../../../lib/job/Job';
import { SourceModel } from '../../../model/mysql';
import { SourceModuleConfig } from './SourceModule';
import { save_manga_list } from './SourceParser';
import { Chapter, Manga, SourceModule } from './';

const ModuleList: { [module: string]: SourceModule } = {};

export const load_modules = () => {
	const mysql = getConnection('mysql');
	const source_repo = mysql.manager.getRepository(SourceModel);

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
									if(await save_manga_list(source.source_id, data)) {
										_res(true);
									} else {
										_res(false);
									}
								}
							});
					});
				};

				const cache_all = async (): Promise<boolean> => {
					return await new Promise((res) => {
						const data_list: any[] = [];
						const limit = 1000;
						let start = 0;
						let success = false;
						let _continue = true;
						(async () => {
							while(_continue) {
								await new Promise((_res) => {
									exec(`ruby ./module/execute_module.rb ${title}\
										${JOB_TYPE.CACHE_ALL} ${limit} ${start}`,
									async (err, stdout, stderr) => {
										if(stderr || !source) {
											_res(false);
										} else {
											const data = JSON.parse(stdout);
											if(data.length > 0) {
												start+=limit;
												data_list.push(...data);
												_res(true);
											} else {
												_continue = false;
												_res(true);
											}
										}
									});
								});
							}
							if(source && data_list.length > 0) {
								success = await save_manga_list(source.source_id, data_list);
								res(success);
							}
						})();
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