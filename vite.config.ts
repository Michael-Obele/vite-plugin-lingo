import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import lingo from './src/lib/plugin/index.js';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		// Use the plugin for development testing
		lingo({
			route: '/_translations',
			localesDir: './locales',
			production: true  // ⚠️ Add authentication!
		})
	],
	optimizeDeps: {
		exclude: ['lightningcss']
	},    
});
