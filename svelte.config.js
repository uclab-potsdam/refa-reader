// import adapter from '@sveltejs/adapter-auto';
import adapter from '@sveltejs/adapter-static';

import { mdsvex } from 'mdsvex';
import mdsvexConfig from './mdsvex.config.js';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', ...mdsvexConfig.extensions],
	preprocess: [
		mdsvex(mdsvexConfig)
	],
	kit: {
		adapter: adapter(
			{
				fallback: 'index.html',
			}
		),
		alias: {
			'@components': 'src/components',
			'@stores': 'src/stores.js',
			'@utils': 'src/utils.js',
		}
	}
};

export default config;