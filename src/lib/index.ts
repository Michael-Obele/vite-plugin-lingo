// Reexport your entry components here

// Main plugin export
export { default as lingoPlugin } from './plugin/index.js';
export { default } from './plugin/index.js';
export type { PluginOptions, Translation, Language, LanguageStats } from './plugin/types.js';

// UI components (for customization)
export { default as LingoApp } from './ui/App.svelte';
export { default as LanguageList } from './ui/components/LanguageList.svelte';
export { default as TranslationEditor } from './ui/components/TranslationEditor.svelte';
export { default as SearchBar } from './ui/components/SearchBar.svelte';
export { default as ProgressBar } from './ui/components/ProgressBar.svelte';
