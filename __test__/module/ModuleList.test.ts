import { exec } from 'child_process';
import path from 'path';

import { SourceModuleConfig } from '../../src/lib/core/source/SourceModule';
import { read_modules } from '../../src/lib/core/source/ModuleList';

let module_list: {
	title: string;
	module_config: SourceModuleConfig;
}[] = [];

describe('parse modules', () => {
	beforeEach(async () => {
		module_list = await read_modules();
	});

	afterEach(() => {
		module_list = [];
	});

	test('atleast 1 module loaded correctly', async () => {
		expect(module_list.length).toBeGreaterThan(0);
	});

	test('all modules loaded correctly', async () => {
		module_list = await read_modules();
		const file_list: string[] = await new Promise<string[]>((resolve) => {
			exec('ls ./module/source_*.rb', (err, stdout) => {
				resolve(stdout.trim().split('\n'));
			});
		});
		for(const i in file_list) {
			const file = file_list[i];
			const title = path.basename(file).split('.')[0].split('_')[1];
			const module = module_list[i];
			expect(title).toEqual(module.title);
		}
	});
});