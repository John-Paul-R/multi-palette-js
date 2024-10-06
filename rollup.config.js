
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import replace from '@rollup/plugin-replace';
import postcss from 'rollup-plugin-postcss'
import pkg from './package.json' with { type: 'json' };
import sass from '@csstools/postcss-sass';
import cssnano from 'cssnano';
import cssimport from "rollup-plugin-import-css";
import { readFileSync } from 'fs';

const fileData = JSON.parse(readFileSync('src/default_palettes.json'));

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
				plugins: [terser({ module: false, mangle: true })]
			},
			{ file: pkg.main, format: 'cjs' },
			{ file: pkg.module, format: 'es' },
		],
		plugins: [
			replace({
				'__PALETTES__': JSON.stringify(fileData.palettes),
				'__DEFAULT_PALLETE_INDICIES__': JSON.stringify(fileData.defaults),
			}),
			cssimport()
		],
	},
	{
		input: 'src/multi-palette.css',
		output: {
			file: 'dist/multi-palette.css',
			format: 'es'
		},
		plugins: [
			postcss({
				modules: true,
				extract: true,
				plugins: [
					sass({}),
					cssnano({}),
				],
			})
		]
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
