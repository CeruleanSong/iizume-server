import { getConnection } from 'typeorm';

import ModuleList from '../core/source/ModuleList';
import { SourceModel } from '../../model/mysql';
import { CompletedJob, Job } from './Job';

const modules = ModuleList;

export const cache_manga = async (payload: Job, done: any): Promise<void> => {
	const res: CompletedJob = { success: false };
	res.success ? done(null, payload) : done(Error('JOB_FAILED'));
	return;
};

export const cache_chapter_list = async (payload: Job, done: any): Promise<void> => {
	const res: CompletedJob = { success: false };
	res.success ? done(null, payload) : done(Error('JOB_FAILED'));
	return;
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