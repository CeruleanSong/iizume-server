import { JOB_TYPE } from '../../src/lib/core/source/Job';
import { execute_job } from '../../src/lib/core/source/ModuleList';

const modulename = 'mangasee';

describe(`test module, ${modulename}`, () => {
	const manga_origin = '/manga/The-Irregular-of-the-Royal-Academy-of-Magic';
	const chapter_origin = '/read-online/The-Irregular-of-the-Royal-Academy-of-Magic-chapter-1.html';

	test(`${JOB_TYPE.CACHE_MANGA}, ${modulename}`, async () => {
		const result = await execute_job(
			modulename,
			JOB_TYPE.CACHE_MANGA,
			'/manga/The-Irregular-of-the-Royal-Academy-of-Magic'
		);
		expect(result).toBeTruthy();
	});

	test(`${JOB_TYPE.CACHE_CHAPTER_LIST}, ${modulename}`, async () => {
		const result = await execute_job(
			modulename,
			JOB_TYPE.CACHE_CHAPTER_LIST,
			manga_origin
		);
		expect(result).toBeTruthy();
		expect(result.length).toBeGreaterThan(0);
	});

	test(`${JOB_TYPE.CACHE_PAGE_LIST}, ${modulename}`, async () => {
		const result = await execute_job(
			modulename,
			JOB_TYPE.CACHE_PAGE_LIST,
			chapter_origin
		);
		expect(result).toBeTruthy();
		expect(result.length).toBeGreaterThan(0);
	});

	test(`${JOB_TYPE.CACHE_HOT}, ${modulename}`, async () => {
		const result = await execute_job(modulename, JOB_TYPE.CACHE_HOT);
		expect(result).toBeTruthy();
		expect(result.length).toBeGreaterThan(0);
	});

	test(`${JOB_TYPE.CACHE_LATEST}, ${modulename}`, async () => {
		const result = await execute_job(modulename, JOB_TYPE.CACHE_LATEST);
		expect(result).toBeTruthy();
		expect(result.length).toBeGreaterThan(0);
	});

	test(`${JOB_TYPE.CACHE_ALL}, ${modulename}`, async () => {
		const result = await execute_job(modulename, JOB_TYPE.CACHE_ALL);
		expect(result).toBeTruthy();
		expect(result.length).toBeGreaterThan(0);
	});
});
