import { getConnection } from 'typeorm';

import ModuleList from '../core/source/ModuleList';
import { CompletedJob, Job } from './Job';
import { MangaModel, MangaSourceModel, SourceModel } from '../../model/mysql';

const modules = ModuleList;

export const cache_manga = async (payload: Job, done: any): Promise<void> => {
	const mysql = getConnection('mysql');
	const manga_repo = mysql.manager.getRepository(MangaModel);
	const manga_source_repo = mysql.manager.getRepository(MangaSourceModel);
	const source = (await manga_source_repo.query(`
		SELECT T1.*, title FROM
		(SELECT source_id, manga_id FROM manga_source
		WHERE manga_id = ?) AS T1
		JOIN source
		ON T1.source_id = source.source_id
	`, [ payload.target ]))[0];
	const manga = await manga_repo.findOne({ where: { manga_id: payload.target } });

	if(source && manga) {
		const success = await modules[source.title].cache_manga(manga);
		if(success) {
			return done(null, payload);
		} else {
			return done(null, 'JOB_FAILED');
		}
	} else {
		return done(Error('UNKNOWN_SOURCE'));
	}
};

export const cache_chapter_list = async (payload: Job, done: any): Promise<void> => {
	const mysql = getConnection('mysql');
	const manga_repo = mysql.manager.getRepository(MangaModel);
	const source = (await manga_repo.query(`
		SELECT T1.*, title FROM
		(SELECT source_id, manga_id FROM manga_source
		WHERE manga_id = ?) AS T1
		JOIN source
		ON T1.source_id = source.source_id
	`, [ payload.target ]))[0];
	const manga = await manga_repo.findOne({ where: { manga_id: payload.target } });
	if(source && manga) {
		const success = await modules[source.title].cache_chapter_list(manga);
		if(success) {
			return done(null, payload);
		} else {
			return done(null, 'JOB_FAILED');
		}
	} else {
		return done(Error('UNKNOWN_SOURCE'));
	}
};

export const cache_page_list = async (payload: Job, done: any): Promise<void> => {
	const res: CompletedJob = { success: false };
	res.success ? done(null, payload) : done(Error('JOB_FAILED'));
	return;
};

export const cache_hot = async (payload: Job, done: any): Promise<void> => {
	const res: CompletedJob = { success: false };
	res.success ? done(null, payload) : done(Error('JOB_FAILED'));
	return;
};

export const cache_latest = async (payload: Job, done: any): Promise<void> => {
	const mysql = getConnection('mysql');
	const source_repo = mysql.manager.getRepository(SourceModel);
	const source = await source_repo.findOne({ where: { source_id: payload.target } });
	if(source) {
		const success = await modules[source.title].cache_latest();
		if(success) {
			return done(null, payload);
		} else {
			return done(null, 'JOB_FAILED');
		}
	} else {
		return done(Error('UNKNOWN_SOURCE'));
	}
};

export const cache_all = async (payload: Job, done: any): Promise<void> => {
	const mysql = getConnection('mysql');
	const source_repo = mysql.manager.getRepository(SourceModel);
	const source = await source_repo.findOne({ where: { source_id: payload.target } });
	if(source) {
		const success = await modules[source.title].cache_all();
		if(success) {
			return done(null, payload);
		} else {
			return done(null, 'JOB_FAILED');
		}
	} else {
		return done(Error('UNKNOWN_SOURCE'));
	}
};