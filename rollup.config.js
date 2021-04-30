
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

export default [
	// browser-friendly UMD build
	{
		input: 'src/multi-palette.js',
		output: {
			name: 'mpal',
			file: "dist/multi-palette.js",
			format: 'iife'
		},

	},
    {
		input: 'src/multi-palette.js',
		output: {
			name: 'mpal',
			file: pkg.browser,
			format: 'iife',
            plugins: [terser({module: false, mangle: true})] 
		},
	},


	// CommonJS (for Node) and ES module (for bundlers) build.
	// (We could have three entries in the configuration array
	// instead of two, but it's quicker to generate multiple
	// builds from a single configuration where possible, using
	// an array for the `output` option, where we can specify
	// `file` and `format` for each target)
	{
		input: 'src/multi-palette.js',
		// external: ['ms'],
		output: [
			{ file: pkg.main, format: 'cjs' },
			{ file: pkg.module, format: 'es' }
		]
	},
    {
		input: 'src/multi-palette.js',
		// external: ['ms'],
		output: [
			{ file: pkg.main, format: 'cjs' },
			{ file: pkg.module, format: 'es' }
		]
	},
];
