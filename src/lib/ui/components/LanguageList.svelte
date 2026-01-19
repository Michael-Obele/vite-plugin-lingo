<script lang="ts">
	import { onMount } from 'svelte';
	import { Languages, RefreshCw, LoaderCircle, TriangleAlert, FolderOpen } from '@lucide/svelte';
	import { getRefreshCount } from '../stores/refresh-signal.svelte';

	interface LanguageStats {
		code: string;
		name: string;
		total: number;
		translated: number;
		fuzzy: number;
		untranslated: number;
		progress: number;
	}

	interface Props {
		selected: string | null;
		apiBase?: string;
	}

	let { selected = $bindable<string | null>(null), apiBase = '.' }: Props = $props();

	let languages = $state<LanguageStats[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let refreshing = $state(false);

	onMount(async () => {
		await loadLanguages();
	});


	async function loadLanguages() {
		if (refreshing) return;
		
		loading = languages.length === 0;
		refreshing = true;
		error = null;

		// Create abort controller with 30 second timeout to prevent hanging requests
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 30000);

		try {
			const res = await fetch(`${apiBase}/api/languages`, {
				signal: controller.signal
			});
			const result = await res.json();

			if (!result.success) {
				throw new Error(result.error || 'Failed to load languages');
			}

			languages = result.data || [];
		} catch (e) {
			if (e instanceof Error && e.name === 'AbortError') {
				error = 'Request timed out - API is slow or unreachable';
			} else {
				error = e instanceof Error ? e.message : 'Failed to load languages';
			}
		} finally {
			clearTimeout(timeout);
			loading = false;
			refreshing = false;
		}
	}

	function getProgressColor(progress: number): string {
		if (progress >= 90) return 'bg-emerald-500';
		if (progress >= 50) return 'bg-amber-500';
		return 'bg-red-500';
	}

	function getProgressTextColor(progress: number): string {
		if (progress >= 90) return 'text-emerald-600 dark:text-emerald-400';
		if (progress >= 50) return 'text-amber-600 dark:text-amber-400';
		return 'text-red-600 dark:text-red-400';
	}

	// TODO: Auto-refresh when translations are updated, but efficiently
</script>

<div class="flex h-full flex-col">
	<!-- Header -->
	<div class="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
		<div class="flex items-center gap-2">
			<Languages class="h-4 w-4 text-slate-400" />
			<h2 class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Languages</h2>
		</div>
		<button
			type="button"
			class="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50 dark:hover:bg-slate-700 dark:hover:text-slate-300"
			onclick={loadLanguages}
			disabled={refreshing}
			title="Refresh languages"
		>
			<RefreshCw class="h-4 w-4 {refreshing ? 'animate-spin' : ''}" />
		</button>
	</div>

	<!-- Content -->
	{#if loading}
		<div class="flex flex-1 flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
			<LoaderCircle class="h-6 w-6 animate-spin" />
			<span class="text-sm">Loading languages...</span>
		</div>
	{:else if error}
		<div class="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
			<TriangleAlert class="h-8 w-8 text-red-400" />
			<p class="text-sm text-red-600 dark:text-red-400">{error}</p>
			<button
				type="button"
				class="btn btn-secondary text-sm"
				onclick={loadLanguages}
			>
				Retry
			</button>
		</div>
	{:else if languages.length === 0}
		<div class="flex flex-1 flex-col items-center justify-center gap-2 px-4 text-center text-slate-500 dark:text-slate-400">
			<FolderOpen class="h-8 w-8 text-slate-300 dark:text-slate-600" />
			<p class="text-sm font-medium">No .po files found</p>
			<p class="text-xs text-slate-400 dark:text-slate-500">Add .po files to your locales directory</p>
		</div>
	{:else}
		<ul class="flex-1 overflow-y-auto p-2">
			{#each languages as lang (lang.code)}
				<li>
					<button
						type="button"
						class="group w-full rounded-lg p-3 text-left transition-colors {selected === lang.code
							? 'bg-blue-50 ring-1 ring-blue-200 dark:bg-blue-900/30 dark:ring-blue-700'
							: 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}"
						onclick={() => (selected = lang.code)}
					>
						<div class="flex items-start justify-between">
							<div>
								<span class="block font-medium text-slate-900 dark:text-white {selected === lang.code ? 'text-blue-900 dark:text-blue-300' : ''}">
									{lang.name}
								</span>
								<span class="text-xs text-slate-500 dark:text-slate-400">{lang.code}</span>
							</div>
							<span class="text-xs font-medium {getProgressTextColor(lang.progress)}">
								{lang.progress}%
							</span>
						</div>

						<!-- Progress bar -->
						<div class="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
							<div
								class="h-full transition-all duration-300 {getProgressColor(lang.progress)}"
								style="width: {lang.progress}%"
							></div>
						</div>

						<!-- Stats -->
						<div class="mt-2 flex gap-3 text-xs text-slate-500 dark:text-slate-400">
							<span class="flex items-center gap-1">
								<span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
								{lang.translated}
							</span>
							<span class="flex items-center gap-1">
								<span class="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
								{lang.fuzzy}
							</span>
							<span class="flex items-center gap-1">
								<span class="h-1.5 w-1.5 rounded-full bg-red-500"></span>
								{lang.untranslated}
							</span>
						</div>
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>
