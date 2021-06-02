
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import replace from '@rollup/plugin-replace';
import pkg from './package.json';
import { readFileSync } from 'fs';

export default [
	// browser-friendly UMD build
	{
		input: 'src/multi-palette.js',
		output: [
			{
				name: 'mpal',
				file: "dist/multi-palette.js",
				format: 'iife'
			}, {
				name: 'mpal',
				file: pkg.browser,
				format: 'iife',
				plugins: [terser({module: false, mangle: true})] 
			},
			{ file: pkg.main, format: 'cjs' },
			{ file: pkg.module, format: 'es' },
		],
		plugins: [
			replace({
				'__PALETTES__': JSON.stringify(JSON.parse(readFileSync('src/default_palettes.json')).palettes),
			})
		],
	},

	// },
    // {
	// 	input: 'src/multi-palette.js',
	// 	output: {
	// 		name: 'mpal',
	// 		file: pkg.browser,
	// 		format: 'iife',
    //         plugins: [terser({module: false, mangle: true})] 
	// 	},
	// },


	// CommonJS (for Node) and ES module (for bundlers) build.
	// (We could have three entries in the configuration array
	// instead of two, but it's quicker to generate multiple
	// builds from a single configuration where possible, using
	// an array for the `output` option, where we can specify
	// `file` and `format` for each target)
	// {
	// 	input: 'src/multi-palette.js',
	// 	// external: ['ms'],
	// 	output: [
	// 		{ file: pkg.main, format: 'cjs' },
	// 		{ file: pkg.module, format: 'es' }
	// 	]
	// },
    // {
	// 	input: 'src/multi-palette.js',
	// 	// external: ['ms'],
	// 	output: [
	// 		{ file: pkg.main, format: 'cjs' },
	// 		{ file: pkg.module, format: 'es' }
	// 	]
	// },
];
