<script lang="ts">
	import {
		LoaderCircle,
		TriangleAlert,
		FileText,
		Pencil,
		Check,
		X,
		MapPin,
		CircleCheck,
		CircleAlert,
		CircleDashed,
		Flag,
		FlagOff,
		MessageSquareText,
		Info
	} from '@lucide/svelte';
	import { triggerRefresh } from '../stores/refresh-signal.svelte';

	interface Translation {
		msgid: string;
		msgstr: string;
		context?: string;
		fuzzy?: boolean;
		comments?: {
			reference?: string;
			translator?: string;
			extracted?: string;
			flag?: string;
		};
	}

	interface Props {
		language: string;
		searchQuery: string;
		filter: 'all' | 'translated' | 'untranslated' | 'fuzzy';
	}

	let { language, searchQuery, filter }: Props = $props();

	let translations = $state<Translation[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let saving = $state<string | null>(null);
	let editingId = $state<string | null>(null);
	let editValue = $state('');
	let togglingFuzzy = $state<string | null>(null);

	// Derived filtered translations
	let filteredTranslations = $derived.by(() => {
		let result = translations;

		// Apply filter
		switch (filter) {
			case 'translated':
				result = result.filter((t) => t.msgstr && !t.fuzzy);
				break;
			case 'untranslated':
				result = result.filter((t) => !t.msgstr);
				break;
			case 'fuzzy':
				result = result.filter((t) => t.fuzzy);
				break;
		}

		// Apply search
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			result = result.filter(
				(t) =>
					t.msgid.toLowerCase().includes(query) || t.msgstr.toLowerCase().includes(query)
			);
		}

		return result;
	});

	// Stats
	let stats = $derived({
		total: translations.length,
		translated: translations.filter((t) => t.msgstr && !t.fuzzy).length,
		untranslated: translations.filter((t) => !t.msgstr).length,
		fuzzy: translations.filter((t) => t.fuzzy).length
	});

	// Load translations when language changes
	$effect(() => {
		if (language) {
			loadTranslations();
		}
	});

	async function loadTranslations() {
		loading = true;
		error = null;

		try {
			const res = await fetch(`./api/translations/${language}`);
			const result = await res.json();

			if (!result.success) {
				throw new Error(result.error || 'Failed to load translations');
			}

			translations = result.data || [];
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load translations';
		} finally {
			loading = false;
		}
	}

	function startEdit(t: Translation) {
		editingId = t.msgid;
		editValue = t.msgstr;
	}

	function cancelEdit() {
		editingId = null;
		editValue = '';
	}

	async function saveEdit(t: Translation) {
		if (editValue === t.msgstr) {
			cancelEdit();
			return;
		}

		saving = t.msgid;

		try {
			const res = await fetch(`./api/translations/${language}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					msgid: t.msgid,
					msgstr: editValue,
					context: t.context
				})
			});

			const result = await res.json();

			if (!result.success) {
				throw new Error(result.error || 'Failed to save');
			}

			// Update local state
			const index = translations.findIndex((tr) => tr.msgid === t.msgid);
			if (index !== -1) {
				translations[index] = { ...translations[index], msgstr: editValue };
			}

			// Notify the language list to refresh stats
			triggerRefresh();

			cancelEdit();
		} catch (e) {
			alert(e instanceof Error ? e.message : 'Failed to save');
		} finally {
			saving = null;
		}
	}

	function handleKeydown(e: KeyboardEvent, t: Translation) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			saveEdit(t);
		}
		if (e.key === 'Escape') {
			cancelEdit();
		}
	}

	async function toggleFuzzy(t: Translation) {
		togglingFuzzy = t.msgid;

		try {
			const res = await fetch(`./api/translations/${language}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					msgid: t.msgid,
					msgstr: t.msgstr,
					context: t.context,
					fuzzy: !t.fuzzy
				})
			});

			const result = await res.json();

			if (!result.success) {
				throw new Error(result.error || 'Failed to toggle fuzzy status');
			}

			// Update local state
			const index = translations.findIndex((tr) => tr.msgid === t.msgid);
			if (index !== -1) {
				translations[index] = { ...translations[index], fuzzy: !t.fuzzy };
			}

			// Notify the language list to refresh stats
			triggerRefresh();
		} catch (e) {
			alert(e instanceof Error ? e.message : 'Failed to toggle fuzzy status');
		} finally {
			togglingFuzzy = null;
		}
	}

	function getStatusIcon(t: Translation) {
		if (t.fuzzy) return { icon: CircleAlert, class: 'text-amber-500' };
		if (t.msgstr) return { icon: CircleCheck, class: 'text-emerald-500' };
		return { icon: CircleDashed, class: 'text-red-400' };
	}
</script>

<div class="flex flex-1 flex-col overflow-hidden">
	<!-- Stats bar -->
	<div class="flex items-center gap-6 border-b border-slate-200 bg-white px-6 py-3 dark:border-slate-700 dark:bg-slate-800">
		<div class="flex items-center gap-2">
			<span class="text-2xl font-semibold text-slate-900 dark:text-white">{stats.total}</span>
			<span class="text-sm text-slate-500 dark:text-slate-400">Total</span>
		</div>
		<div class="flex items-center gap-2">
			<CircleCheck class="h-4 w-4 text-emerald-500" />
			<span class="font-medium text-emerald-600 dark:text-emerald-400">{stats.translated}</span>
			<span class="text-sm text-slate-500 dark:text-slate-400">Translated</span>
		</div>
		<div class="flex items-center gap-2">
			<CircleDashed class="h-4 w-4 text-red-400" />
			<span class="font-medium text-red-600 dark:text-red-400">{stats.untranslated}</span>
			<span class="text-sm text-slate-500 dark:text-slate-400">Untranslated</span>
		</div>
		<div class="flex items-center gap-2">
			<CircleAlert class="h-4 w-4 text-amber-500" />
			<span class="font-medium text-amber-600 dark:text-amber-400">{stats.fuzzy}</span>
			<span class="text-sm text-slate-500 dark:text-slate-400">Fuzzy</span>
		</div>
		<div class="ml-auto text-sm text-slate-500 dark:text-slate-400">
			Showing {filteredTranslations.length} of {stats.total}
		</div>
	</div>

	<!-- Content -->
	{#if loading}
		<div class="flex flex-1 flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
			<LoaderCircle class="h-8 w-8 animate-spin text-blue-500" />
			<span>Loading translations...</span>
		</div>
	{:else if error}
		<div class="flex flex-1 flex-col items-center justify-center gap-4">
			<TriangleAlert class="h-10 w-10 text-red-400" />
			<p class="text-red-600 dark:text-red-400">{error}</p>
			<button type="button" class="btn btn-secondary" onclick={loadTranslations}>
				Retry
			</button>
		</div>
	{:else if filteredTranslations.length === 0}
		<div class="flex flex-1 flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
			<FileText class="h-10 w-10 text-slate-300 dark:text-slate-600" />
			<p class="font-medium">No translations found</p>
			{#if searchQuery || filter !== 'all'}
				<p class="text-sm text-slate-400 dark:text-slate-500">Try adjusting your search or filter</p>
			{/if}
		</div>
	{:else}
		<div class="flex-1 overflow-y-auto">
			<div class="divide-y divide-slate-100 dark:divide-slate-700">
				{#each filteredTranslations as t (t.msgid)}
					{@const status = getStatusIcon(t)}
					<div
						class="group px-6 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 {t.fuzzy
							? 'bg-amber-50/50 dark:bg-amber-900/10'
							: !t.msgstr
								? 'bg-red-50/30 dark:bg-red-900/10'
								: ''}"
					>
						<div class="flex gap-4">
							<!-- Status icon -->
							<div class="shrink-0 pt-0.5">
								<status.icon class="h-5 w-5 {status.class}" />
							</div>

							<!-- Content -->
							<div class="min-w-0 flex-1 space-y-3">
								<!-- Source -->
								<div>
									<div class="mb-1 flex items-center gap-2">
										<span class="text-xs font-medium uppercase tracking-wide text-slate-400">Source</span>
										{#if t.context}
											<span class="badge badge-secondary text-xs">ctx: {t.context}</span>
										{/if}
									</div>
									<code class="block rounded bg-slate-100 px-3 py-2 text-sm text-slate-800 dark:bg-slate-700 dark:text-slate-200">
										{t.msgid}
									</code>
									{#if t.comments?.reference}
										<div class="mt-1 flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
											<MapPin class="h-3 w-3" />
											{t.comments.reference}
										</div>
									{/if}
								</div>

								<!-- Comments (translator notes, extracted comments) -->
								{#if t.comments?.translator || t.comments?.extracted}
									<div class="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-600 dark:bg-slate-800/50">
										{#if t.comments.translator}
											<div class="flex items-start gap-2 text-sm">
												<MessageSquareText class="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
												<div>
													<span class="font-medium text-slate-600 dark:text-slate-300">Translator note:</span>
													<span class="ml-1 text-slate-700 dark:text-slate-200">{t.comments.translator}</span>
												</div>
											</div>
										{/if}
										{#if t.comments.extracted}
											<div class="flex items-start gap-2 text-sm {t.comments.translator ? 'mt-2' : ''}">
												<Info class="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
												<div>
													<span class="font-medium text-slate-600 dark:text-slate-300">Context:</span>
													<span class="ml-1 text-slate-700 dark:text-slate-200">{t.comments.extracted}</span>
												</div>
											</div>
										{/if}
									</div>
								{/if}

								<!-- Translation -->
								<div>
									<div class="mb-1 flex items-center gap-2">
										<span class="text-xs font-medium uppercase tracking-wide text-slate-400">Translation</span>
										{#if t.fuzzy}
											<span class="badge badge-warning">Fuzzy</span>
										{/if}
										<!-- Fuzzy toggle button -->
										{#if t.msgstr}
											<button
												type="button"
												class="ml-auto flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors {t.fuzzy 
													? 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50' 
													: 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-slate-600'}"
												onclick={() => toggleFuzzy(t)}
												disabled={togglingFuzzy === t.msgid}
												title={t.fuzzy ? 'Mark as not fuzzy' : 'Mark as fuzzy (needs review)'}
											>
												{#if togglingFuzzy === t.msgid}
													<LoaderCircle class="h-3 w-3 animate-spin" />
												{:else if t.fuzzy}
													<FlagOff class="h-3 w-3" />
													<span>Unflag</span>
												{:else}
													<Flag class="h-3 w-3" />
													<span>Mark fuzzy</span>
												{/if}
											</button>
										{/if}
									</div>

									{#if editingId === t.msgid}
										<!-- Edit mode -->
										<div class="space-y-2">
											<textarea
												bind:value={editValue}
												onkeydown={(e) => handleKeydown(e, t)}
												rows="2"
												class="input w-full resize-none font-mono text-sm"
												placeholder="Enter translation..."
											></textarea>
											<div class="flex items-center gap-2">
												<button
													type="button"
													class="btn btn-primary"
													onclick={() => saveEdit(t)}
													disabled={saving === t.msgid}
												>
													{#if saving === t.msgid}
														<LoaderCircle class="h-4 w-4 animate-spin" />
														Saving...
													{:else}
														<Check class="h-4 w-4" />
														Save
													{/if}
												</button>
												<button type="button" class="btn btn-ghost" onclick={cancelEdit}>
													<X class="h-4 w-4" />
													Cancel
												</button>
												<span class="ml-2 text-xs text-slate-400 dark:text-slate-500">
													Enter to save, Esc to cancel
												</span>
											</div>
										</div>
									{:else}
										<!-- Display mode -->
										<button
											type="button"
											class="group/edit flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
											onclick={() => startEdit(t)}
										>
											{#if t.msgstr}
												<span class="flex-1 text-sm text-slate-800 dark:text-slate-200">{t.msgstr}</span>
											{:else}
												<span class="flex-1 text-sm italic text-slate-400 dark:text-slate-500">Click to add translation</span>
											{/if}
											<Pencil class="h-4 w-4 shrink-0 text-slate-400 opacity-0 transition-opacity group-hover/edit:opacity-100" />
										</button>
									{/if}
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
