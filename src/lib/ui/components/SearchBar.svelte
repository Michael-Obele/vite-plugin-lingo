<script lang="ts">
	import { Search, X } from '@lucide/svelte';

	interface Props {
		query: string;
	}

	let { query = $bindable('') }: Props = $props();

	let inputRef = $state<HTMLInputElement | null>(null);

	function handleKeydown(e: KeyboardEvent) {
		// Ctrl/Cmd + K to focus search
		if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
			e.preventDefault();
			inputRef?.focus();
		}
		// Escape to clear and blur
		if (e.key === 'Escape' && document.activeElement === inputRef) {
			query = '';
			inputRef?.blur();
		}
	}

	// Add global keyboard listener
	$effect(() => {
		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});
</script>

<div class="relative flex items-center">
	<Search class="absolute left-3 h-4 w-4 text-slate-400" />
	<input
		bind:this={inputRef}
		type="text"
		bind:value={query}
		placeholder="Search translations..."
		class="h-9 w-72 rounded-lg border border-slate-300 bg-white pl-9 pr-16 text-sm shadow-sm transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400"
	/>
	{#if query}
		<button
			type="button"
			class="absolute right-3 rounded p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
			onclick={() => (query = '')}
		>
			<X class="h-4 w-4" />
		</button>
	{:else}
		<kbd class="absolute right-3 flex items-center gap-0.5 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-xs text-slate-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400">
			<span class="text-[10px]">⌘</span>K
		</kbd>
	{/if}
</div>
