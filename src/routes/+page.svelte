<script lang="ts">
	import { 
		Palette, 
		Search, 
		Keyboard, 
		Zap, 
		Settings, 
		Terminal, 
		ArrowRight, 
        Globe,
		Check, 
		Copy,
		ChevronDown,
		FileCode
	} from '@lucide/svelte';
	import Highlight from 'svelte-highlight';
	import typescript from 'svelte-highlight/languages/typescript';
	import bash from 'svelte-highlight/languages/bash';
	import githubDark from 'svelte-highlight/styles/github-dark';
	import oneCLight from 'svelte-highlight/styles/1c-light';
	import { mode } from 'mode-watcher';
	

	// State for copy buttons
	let copiedStates = $state({
		install: false,
		config: false
	});

	function copyToClipboard(text: string, key: keyof typeof copiedStates) {
		navigator.clipboard.writeText(text);
		copiedStates[key] = true;
		setTimeout(() => {
			copiedStates[key] = false;
		}, 2000);
	}

	let selectedManager = $state('bun');
	const installCommands = {
		bun: 'bun add -d vite-plugin-lingo',
		npm: 'npm install -D vite-plugin-lingo',
		pnpm: 'pnpm add -D vite-plugin-lingo',
		yarn: 'yarn add -D vite-plugin-lingo'
	};

	let installCommand = $derived(installCommands[selectedManager as keyof typeof installCommands]);

	const configCode = `// vite.config.ts
import { defineConfig } from 'vite';
import lingo from 'vite-plugin-lingo';

export default defineConfig({
  plugins: [
    lingo({
      route: '/_translations', // default
      localesDir: './locales'  // default
    })
  ]
});`;

	const features = [
		{ 
			icon: Palette, 
			title: 'Visual Editor', 
			description: 'Browse and edit .po files in a beautiful, intuitive web interface without touching raw files.' 
		},
		{ 
			icon: Globe, 
			title: 'Language Overview', 
			description: 'Track translation progress across all locales with visual indicators and stats.' 
		},
		{ 
			icon: Search, 
			title: 'Search & Filter', 
			description: 'Instantly find translations by key or text, and filter by missing or fuzzy status.' 
		},
		{ 
			icon: Keyboard, 
			title: 'Keyboard Shortcuts', 
			description: 'Power user friendly with shortcuts for saving (Ctrl+S) and navigation.' 
		},
		{ 
			icon: Zap, 
			title: 'HMR Support', 
			description: 'Instant updates. Edit translations and see them reflect in your app immediately.' 
		},
		{ 
			icon: Settings, 
			title: 'Zero Config', 
			description: 'Auto-detects your locales directory and works out of the box with sensible defaults.' 
		}
	];

		let theme: string = $state('');
	$effect(() => {
		theme = mode.current === 'dark' ? githubDark : oneCLight;
	});
</script>

<svelte:head>
	{@html theme}
</svelte:head>

<main>
		<!-- Hero Section -->
		<section class="pt-20 pb-32 px-4 text-center max-w-4xl mx-auto">
			<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm font-medium mb-8 border border-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800">
				<span class="relative flex h-2 w-2">
				  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
				  <span class="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
				</span>
				Now available for Vite & SvelteKit
			</div>
			
			<h1 class="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 text-balance dark:text-white">
				Translation management <br class="hidden md:block" />
				<span class="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">for modern apps</span>
			</h1>
			
			<p class="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed text-balance dark:text-slate-300">
				A visual editor for <code>.po</code> files that lives in your dev server. 
				Manage translations without leaving your workflow.
			</p>
			
			<div class="flex flex-col sm:flex-row items-center justify-center gap-4">
				<a href="/_translations" class="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 dark:shadow-indigo-900/50 dark:hover:shadow-indigo-800/50">
					Open Editor
					<ArrowRight class="w-4 h-4" />
				</a>
				<a href="#install" class="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-slate-700 font-semibold border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 dark:hover:border-slate-600">
					<Terminal class="w-4 h-4 text-slate-500" />
					Documentation
				</a>
			</div>
		</section>

		<!-- Features Grid -->
		<section class="py-24 bg-slate-50 border-y border-slate-200 dark:bg-slate-800/50 dark:border-slate-700">
			<div class="max-w-6xl mx-auto px-4">
				<div class="text-center mb-16">
					<h2 class="text-3xl font-bold text-slate-900 mb-4 dark:text-white">Everything you need</h2>
					<p class="text-slate-600 max-w-2xl mx-auto dark:text-slate-400">
						Built for developers who want to manage translations efficiently without the context switching.
					</p>
				</div>

				<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
					{#each features as feature (feature.title)}
						<div class="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow dark:bg-slate-800 dark:border-slate-700 dark:hover:border-slate-600">
							<div class="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-6 dark:bg-indigo-900/50 dark:text-indigo-400">
								<feature.icon class="w-6 h-6" />
							</div>
							<h3 class="text-xl font-bold text-slate-900 mb-3 dark:text-white">{feature.title}</h3>
							<p class="text-slate-600 leading-relaxed dark:text-slate-400">
								{feature.description}
							</p>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- Installation & Config -->
		<section id="install" class="py-24 px-4">
			<div class="max-w-4xl mx-auto">
				<div class="grid md:grid-cols-2 gap-12">
					<!-- Install -->
					<div>
						<div class="flex items-center gap-3 mb-6">
							<div class="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 dark:bg-slate-700 dark:text-slate-300">
								<Terminal class="w-5 h-5" />
							</div>
							<h2 class="text-2xl font-bold text-slate-900 dark:text-white">Installation</h2>
						</div>
						<p class="text-slate-600 mb-6 dark:text-slate-400">
							Add the plugin to your project using your preferred package manager.
						</p>
						
						<div class="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-[#0D1117]">
							<div class="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-800">
								<div class="relative">
									<select
										bind:value={selectedManager}
										class="appearance-none rounded bg-transparent py-1 pr-8 pl-2 text-sm font-medium text-gray-700 transition outline-none hover:bg-gray-200 focus:ring-2 focus:ring-indigo-500 dark:text-gray-300 dark:hover:bg-gray-700"
									>
										<option value="bun">bun</option>
										<option value="npm">npm</option>
										<option value="pnpm">pnpm</option>
										<option value="yarn">yarn</option>
									</select>
								</div>
								<button
									onclick={() => copyToClipboard(installCommand, 'install')}
									class="inline-flex items-center gap-2 rounded px-3 py-1 text-sm text-gray-500 transition hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
								>
									{#if copiedStates.install}
										<Check class="h-4 w-4 text-green-500" />
										<span>Copied!</span>
									{:else}
										<Copy class="h-4 w-4" />
										<span>Copy</span>
									{/if}
								</button>
							</div>
							<div class="overflow-x-auto p-4 text-sm bg-white dark:bg-[#0D1117]">
								<Highlight language={bash} code={installCommand} />
							</div>
						</div>
					</div>

					<!-- Config -->
					<div>
						<div class="flex items-center gap-3 mb-6">
							<div class="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 dark:bg-slate-700 dark:text-slate-300">
								<Settings class="w-5 h-5" />
							</div>
							<h2 class="text-2xl font-bold text-slate-900 dark:text-white">Configuration</h2>
						</div>
						<p class="text-slate-600 mb-6 dark:text-slate-400">
							Add it to your <code>vite.config.ts</code>. That's it!
						</p>

						<div class="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-[#0D1117]">
							<div class="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-800">
								<span class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
									<FileCode class="h-4 w-4" />
									vite.config.ts
								</span>
								<button
									onclick={() => copyToClipboard(configCode, 'config')}
									class="inline-flex items-center gap-2 rounded px-3 py-1 text-sm text-gray-500 transition hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
								>
									{#if copiedStates.config}
										<Check class="h-4 w-4 text-green-500" />
										<span>Copied!</span>
									{:else}
										<Copy class="h-4 w-4" />
										<span>Copy</span>
									{/if}
								</button>
							</div>
							<div class="overflow-x-auto p-4 text-sm bg-white dark:bg-[#0D1117]">
								<Highlight language={typescript} code={configCode} />
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	</main>
