import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
	plugins: [svelte(), tailwindcss()],
	root: 'src/lib/ui',
	build: {
		outDir: resolve(__dirname, 'dist/ui-dist'),
		emptyOutDir: true,
		rollupOptions: {
			input: resolve(__dirname, 'src/lib/ui/index.html')
		}
	},
	// Base path for assets
	base: './'
});
