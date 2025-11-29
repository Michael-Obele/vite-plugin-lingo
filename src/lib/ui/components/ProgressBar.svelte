<script lang="ts">
	interface Props {
		value: number;
		max?: number;
		showLabel?: boolean;
		size?: 'sm' | 'md' | 'lg';
	}

	let { value, max = 100, showLabel = true, size = 'md' }: Props = $props();

	let percentage = $derived(Math.round((value / max) * 100));

	let barColor = $derived.by(() => {
		if (percentage >= 90) return 'bg-emerald-500';
		if (percentage >= 50) return 'bg-amber-500';
		return 'bg-red-500';
	});

	let textColor = $derived.by(() => {
		if (percentage >= 90) return 'text-emerald-600 dark:text-emerald-400';
		if (percentage >= 50) return 'text-amber-600 dark:text-amber-400';
		return 'text-red-600 dark:text-red-400';
	});

	let heightClass = $derived.by(() => {
		switch (size) {
			case 'sm':
				return 'h-1';
			case 'lg':
				return 'h-2.5';
			default:
				return 'h-1.5';
		}
	});
</script>

<div class="flex items-center gap-2">
	<div class="flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700 {heightClass}">
		<div
			class="h-full transition-all duration-300 {barColor}"
			style="width: {percentage}%"
		></div>
	</div>
	{#if showLabel}
		<span class="text-xs font-medium {textColor}">{percentage}%</span>
	{/if}
</div>
