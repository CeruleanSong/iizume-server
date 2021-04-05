import { read_modules } from '../../src/lib/core/source/ModuleList';

test('Properly reading modules in module directory.', async () => {
	const modules = await read_modules();
	expect(modules.length).toBeGreaterThan(0);
});