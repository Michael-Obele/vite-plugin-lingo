<script lang="ts">
	import { Globe, FileText, Funnel } from '@lucide/svelte';
	import { ModeWatcher } from 'mode-watcher';
	import LanguageList from './components/LanguageList.svelte';
	import TranslationEditor from './components/TranslationEditor.svelte';
	import SearchBar from './components/SearchBar.svelte';
	import ThemeToggle from './components/ThemeToggle.svelte';

	let selectedLanguage = $state<string | null>(null);
	let searchQuery = $state('');
	let filter = $state<'all' | 'translated' | 'untranslated' | 'fuzzy'>('all');

	const filterOptions = [
		{ value: 'all', label: 'All' },
		{ value: 'translated', label: 'Translated' },
		{ value: 'untranslated', label: 'Untranslated' },
		{ value: 'fuzzy', label: 'Fuzzy' }
	] as const;

	// Listen for .po file updates via HMR
	if (import.meta.hot) {
		import.meta.hot.on('lingo:po-updated', (data: { path: string }) => {
			console.log('[lingo] .po file updated:', data.path);
		});
	}
</script>

<ModeWatcher />

<div class="flex h-screen flex-col bg-slate-50 dark:bg-slate-900">
	<!-- Header -->
	<header class="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
		<div class="flex items-center gap-3">
			<div class="flex items-center gap-2">
				<Globe class="h-5 w-5 text-blue-600 dark:text-blue-400" />
				<h1 class="text-lg font-semibold text-slate-900 dark:text-white">Lingo</h1>
			</div>
			<span class="text-sm text-slate-500 dark:text-slate-400">Translation Editor</span>
		</div>
		<div class="flex items-center gap-4">
			<SearchBar bind:query={searchQuery} />
			<ThemeToggle />
		</div>
	</header>

	<!-- Main content -->
	<main class="flex flex-1 overflow-hidden">
		<!-- Sidebar -->
		<aside class="w-72 overflow-y-auto border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
			<LanguageList bind:selected={selectedLanguage} />
		</aside>

		<!-- Content area -->
		<section class="flex flex-1 flex-col overflow-hidden">
			{#if selectedLanguage}
				<!-- Filter tabs -->
				<div class="flex items-center gap-4 border-b border-slate-200 bg-white px-6 py-3 dark:border-slate-700 dark:bg-slate-800">
					<Funnel class="h-4 w-4 text-slate-400" />
					<div class="flex gap-1">
						{#each filterOptions as option (option.value)}
							<button
								type="button"
								class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors {filter === option.value
									? 'bg-blue-600 text-white dark:bg-blue-500'
									: 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'}"
								onclick={() => (filter = option.value)}
							>
								{option.label}
							</button>
						{/each}
					</div>
				</div>

				<!-- Translation editor -->
				<TranslationEditor
					language={selectedLanguage}
					{searchQuery}
					{filter}
				/>
			{:else}
				<!-- Empty state -->
				<div class="flex flex-1 items-center justify-center bg-slate-50 dark:bg-slate-900">
					<div class="text-center">
						<FileText class="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
						<h2 class="mt-4 text-lg font-medium text-slate-900 dark:text-white">Select a language</h2>
						<p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Choose a language from the sidebar to start editing translations</p>
					</div>
				</div>
			{/if}
		</section>
	</main>
</div>
