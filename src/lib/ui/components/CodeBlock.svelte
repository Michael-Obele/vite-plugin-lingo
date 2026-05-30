<script lang="ts">
	import { Check, Copy } from '@lucide/svelte';
	import Highlight from 'svelte-highlight';

	interface Props {
		code: string;
		language: any;
		title: string;
		icon?: typeof import('@lucide/svelte').Check;
		copied: boolean;
		onCopy: () => void;
	}

	let { code, language, title, icon: Icon, copied, onCopy }: Props = $props();
</script>

<div class="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-[#0D1117] mx-6 mb-6">
	<div class="flex items-center justify-between border-b border-gray-200 px-4 py-2 dark:border-gray-700">
		<span class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
			{#if Icon}
				<Icon class="h-4 w-4" />
			{/if}
			{title}
		</span>
		<button
			onclick={onCopy}
			class="inline-flex items-center gap-2 rounded px-3 py-1 text-sm text-gray-500 transition hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
		>
			{#if copied}
				<Check class="h-4 w-4 text-green-500" />
				<span class="text-green-500">Copied!</span>
			{:else}
				<Copy class="h-4 w-4" />
				<span>Copy</span>
			{/if}
		</button>
	</div>
	<div class="overflow-x-auto p-4 text-sm bg-white dark:bg-[#0D1117]">
		<Highlight {language} {code} />
	</div>
</div>
