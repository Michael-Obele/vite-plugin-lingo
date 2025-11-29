/**
 * Simple reactive signal to notify the LanguageList when translations are updated.
 * Using Svelte 5 runes for fine-grained reactivity.
 */

let refreshCount = $state(0);

export function getRefreshCount() {
	return refreshCount;
}

export function triggerRefresh() {
	refreshCount++;
}
