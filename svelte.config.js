// import adapter from '@sveltejs/adapter-auto';
import adapter from '@sveltejs/adapter-static';
import { mdsvex } from 'mdsvex';
import mdsvexConfig from './mdsvex.config.js';
const dev = process.argv.includes('dev');

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', ...mdsvexConfig.extensions],
	preprocess: [
		mdsvex(mdsvexConfig)
	],
	kit: {
		adapter: adapter({
			fallback: 'index.html',
			precompress:true
		}),
		paths: {
			base: dev ? '' : process.env.BASE_PATH,
		},
		prerender: {
			crawl: true,
			entries: ['/'],
		},
		alias: {
			'@components': 'src/components',
			'@stores': 'src/stores.js',
			'@utils': 'src/utils.js',
		},
	}
};

export default config;
