<script lang="ts">
	import './layout.css';
	import { ModeWatcher } from 'mode-watcher';
	import { Globe, Github } from '@lucide/svelte';
	import ThemeToggle from '$lib/ui/components/ThemeToggle.svelte';
	import type { LayoutProps } from './$types.js';

	let { data, children }: LayoutProps = $props();
</script>

<ModeWatcher />

<div class="min-h-screen bg-white text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 font-sans dark:bg-slate-900 dark:text-white dark:selection:bg-indigo-900 dark:selection:text-indigo-100">
	<!-- Navigation -->
	<nav class="border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur-md z-50 dark:border-slate-700 dark:bg-slate-900/80">
		<div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
			<div class="flex items-center gap-2 font-bold text-xl tracking-tight">
				<Globe class="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
				<span>vite-plugin-lingo</span>
			</div>
			<div class="flex items-center gap-4">
				<a href="https://github.com/Michael-Obele/vite-plugin-lingo" target="_blank" rel="noreferrer" class="text-slate-500 hover:text-slate-900 transition-colors dark:text-slate-400 dark:hover:text-white">
					<Github class="w-5 h-5" />
				</a>
				<a href="https://www.npmjs.com/package/vite-plugin-lingo" target="_blank" rel="noreferrer" class="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors dark:text-slate-400 dark:hover:text-white">
					v{data.npmVersion}
				</a>
                <!--  -->
                <ThemeToggle/>
			</div>
		</div>
	</nav>

	{@render children()}

	<footer class="bg-slate-50 border-t border-slate-200 py-12 mt-12 dark:bg-slate-800/50 dark:border-slate-700">
		<div class="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
			<div class="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
				<Globe class="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
				<span>vite-plugin-lingo</span>
			</div>
			<div class="flex gap-8 text-sm font-medium text-slate-600 dark:text-slate-400">
				<a href="https://github.com/Michael-Obele/vite-plugin-lingo" class="hover:text-indigo-600 transition-colors dark:hover:text-indigo-400">GitHub</a>
				<a href="https://www.npmjs.com/package/vite-plugin-lingo" class="hover:text-indigo-600 transition-colors dark:hover:text-indigo-400">npm</a>
				<a href="https://svelte.dev" class="hover:text-indigo-600 transition-colors dark:hover:text-indigo-400">Svelte</a>
			</div>
			<p class="text-sm text-slate-500 dark:text-slate-400">
				<a href="/LICENSE" class="hover:text-indigo-600 transition-colors dark:hover:text-indigo-400">AGPL-3.0-or-later</a> © 2025
			</p>
		</div>
	</footer>
</div>
