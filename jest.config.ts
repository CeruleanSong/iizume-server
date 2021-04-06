import type { Config } from '@jest/types';

// Sync object
const config: Config.InitialOptions = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	moduleFileExtensions: [ 'ts', 'js', 'json', 'node' ],
	testPathIgnorePatterns: [ '__test__/execute_module' ],
	roots: [
		  '__test__/'
	],
	coverageReporters: [
		'json',
		'text',
		'lcov',
		'clover'
	],
	verbose: true
};

export default config;