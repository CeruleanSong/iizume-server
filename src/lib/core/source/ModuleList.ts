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

export const execute_job = async (module: string, job_type: JOB_TYPE, target = '') => {
	return await new Promise<any | null>((resolve) => {
		let output = '';
		const cp = spawn('ruby', [
			'./module/execute_module.rb',
			module,
			job_type,
			target
		]);

		cp.stdout.on('data', (data) => {
			output+=data;
		});

		cp.on('error', () => {
			resolve(null);
		});

		cp.on('close', async (code) => {
			if(code === 0) {
				try {
					resolve(JSON.parse(output));
				} catch {
					resolve(null);
				}
			} else {
				resolve(null);
			}
		});
	});
};

export const read_modules = async () => {
	const modules: any[] = [];
	const file_list: string[] = await new Promise<string[]>((resolve) => {
		exec('ls ./module/source_*.rb', (err, stdout) => {
			resolve(stdout.trim().split('\n'));
		});
	});
	for(const i in file_list) {
		const file = file_list[i];
		if(file.length > 0) {
			const title = path.basename(file).split('.')[0].split('_')[1];
			const config_path = path.basename(file).split('.')[0];
			const module_path = path.join('../../../../', `./module/${config_path}.json`);
			const module_config: SourceModuleConfig = (await import(module_path)).default;
			modules.push({
				title,
				module_config
			});
		}
	}
	return modules;
};

export const load_modules = async () => {
	const mariadb = getConnection('mariadb');
	const source_repo = mariadb.manager.getRepository(SourceModel);

	const modules = await read_modules();

	for(const i in modules) {
		const title = modules[i].title;
		const module_config = modules[i].module_config;
				
		const source = await source_repo.findOne({ where: { title: title } });
				
		if(source) {
			const payload = {
				...source,
				...module_config
			};
			source_repo.update({ source_id: source.source_id }, payload);
		} else {
			const payload = {
				...new SourceModel(),
				...module_config,
				source_id: uid(16)
			};
			source_repo.save(payload);
		}

		const cache_manga = async (manga: MangaModel) => {
			const manga_data = await execute_job(title, JOB_TYPE.CACHE_MANGA, manga.origin);
			if(manga_data && source) {
				if(await save_manga(manga.manga_id, manga_data)) {
					return true;
				} else {
					return false;
				}
			} else {
				return false;
			}
		};

		const cache_chapter_list = async (manga: MangaModel) => {
			const chapter_list = await execute_job(title, JOB_TYPE.CACHE_CHAPTER_LIST, manga.origin);
			if(chapter_list && source) {
				if(await save_chapter_list(manga.manga_id, chapter_list)) {
					return true;
				} else {
					return false;
				}
			} else {
				return false;
			}
		};

		const cache_page_list = async (chapter: ChapterModel) => {
			const page_list = await execute_job(title, JOB_TYPE.CACHE_PAGE_LIST, chapter.origin);
			if(page_list && source) {
				if(await save_page_list(chapter.chapter_id, page_list)) {
					return true;
				} else {
					return false;
				}
			} else {
				return false;
			}
		};

		const cache_hot = async () => {
			const manga_list = await execute_job(title, JOB_TYPE.CACHE_HOT);
			if(manga_list && source) {
				if(await save_manga_list(source.source_id, manga_list)) {
					return true;
				} else {
					return false;
				}
			} else {
				return false;
			}
		};

		const cache_latest = async () => {
			const manga_list = await execute_job(title, JOB_TYPE.CACHE_LATEST);
			if(manga_list && source) {
				if(await save_manga_list(source.source_id, manga_list)) {
					return true;
				} else {
					return false;
				}
			} else {
				return false;
			}
		};

		const cache_all = async () => {
			const manga_list = await execute_job(title, JOB_TYPE.CACHE_ALL);
			if(manga_list && source) {
				if(await save_manga_list(source.source_id, manga_list)) {
					return true;
				} else {
					return false;
				}
			} else {
				return false;
			}
		};

		const loaded_module: SourceModule = {
			...module_config,
			cache_manga,
			cache_chapter_list,
			cache_page_list,
			cache_hot,
			cache_latest,
			cache_all
		};

		ModuleList[title] = loaded_module;
	}
};
	
export default ModuleList;