import { svelte } from '@sveltejs/vite-plugin-svelte';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [svelte()],
	server: {
		proxy: {
			'/music': {
				target: 'http://localhost:3000',
				changeOrigin: true,
				secure: false
			}
		}
	}
};

export default config;
