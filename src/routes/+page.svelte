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
		FileCode,
		Layout,
		Languages
	} from '@lucide/svelte';
	import Highlight from 'svelte-highlight';
	import typescript from 'svelte-highlight/languages/typescript';
	import bash from 'svelte-highlight/languages/bash';
	import githubDark from 'svelte-highlight/styles/github-dark';
	import oneCLight from 'svelte-highlight/styles/1c-light';
	import { mode } from 'mode-watcher';
	import { fly, fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	

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
			description: 'Browse and edit .po files in a beautiful, intuitive web interface without touching raw files.',
			class: 'md:col-span-2'
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

	// Keep this to fix the theme not matching on first load
		let theme = $state('');
		$effect(() => {
			theme = mode.current === 'dark' ? githubDark : oneCLight;
		});
</script>

<svelte:head>
	{@html theme}
</svelte:head>

<main class="relative overflow-hidden">
		<!-- Background Blobs -->
		<div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] -z-10 opacity-30 dark:opacity-20 pointer-events-none overflow-hidden">
			<div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-400/30 blur-[120px] animate-pulse"></div>
			<div class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-400/30 blur-[120px] animate-pulse delay-1000"></div>
		</div>

		<!-- Hero Section -->
		<section class="pt-24 pb-32 px-4 text-center max-w-5xl mx-auto">
			<div in:fly={{ y: 20, duration: 800, delay: 200 }} class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm font-medium mb-8 border border-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800 shadow-sm">
				<span class="relative flex h-2 w-2">
				  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
				  <span class="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
				</span>
				Now available for Vite & SvelteKit
			</div>
			
			<h1 in:fly={{ y: 20, duration: 800, delay: 300 }} class="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 text-balance dark:text-white leading-[1.1]">
				Translation management <br class="hidden md:block" />
				<span class="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 via-violet-600 to-fuchsia-600 dark:from-indigo-400 dark:via-violet-400 dark:to-fuchsia-400">for modern apps</span>
			</h1>
			
			<p in:fly={{ y: 20, duration: 800, delay: 400 }} class="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed text-balance dark:text-slate-300">
				A visual editor for <code>.po</code> files that lives in your dev server. 
				Manage translations without leaving your workflow.
			</p>
			
			<div in:fly={{ y: 20, duration: 800, delay: 500 }} class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
				<a href="/_translations" class="group inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 dark:shadow-indigo-900/50 dark:hover:shadow-indigo-800/50">
					Open Editor
					<ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
				</a>
				<a href="#install" class="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-slate-700 font-semibold border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 dark:hover:border-slate-600">
					<Terminal class="w-4 h-4 text-slate-500" />
					Documentation
				</a>
			</div>

			<!-- Mock UI Preview -->
			<div in:fly={{ y: 40, duration: 1000, delay: 600 }} class="relative mx-auto max-w-4xl rounded-xl border border-slate-200 bg-white/50 shadow-2xl backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/50 overflow-hidden">
				<div class="flex items-center gap-2 border-b border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/80">
					<div class="flex gap-1.5">
						<div class="h-3 w-3 rounded-full bg-red-400"></div>
						<div class="h-3 w-3 rounded-full bg-amber-400"></div>
						<div class="h-3 w-3 rounded-full bg-green-400"></div>
					</div>
					<div class="mx-auto flex items-center gap-2 rounded-md bg-white px-3 py-1 text-xs font-medium text-slate-500 shadow-sm dark:bg-slate-900 dark:text-slate-400">
						<Globe class="h-3 w-3" />
						localhost:5173/_translations
					</div>
				</div>
				<div class="grid grid-cols-[240px_1fr] h-[400px] text-left">
					<!-- Mock Sidebar -->
					<div class="border-r border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/30">
						<div class="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Locales</div>
						<div class="space-y-1">
							<div class="flex items-center justify-between rounded-md bg-indigo-100 px-3 py-2 text-sm font-medium text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
								<span>English (en)</span>
								<span class="text-xs opacity-70">100%</span>
							</div>
							<div class="flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
								<span>Spanish (es)</span>
								<span class="text-xs opacity-70">85%</span>
							</div>
							<div class="flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
								<span>French (fr)</span>
								<span class="text-xs opacity-70">42%</span>
							</div>
						</div>
					</div>
					<!-- Mock Content -->
					<div class="p-6 bg-white dark:bg-slate-900">
						<div class="mb-6 flex items-center justify-between">
							<h3 class="font-semibold text-slate-900 dark:text-white">Translations</h3>
							<div class="flex gap-2">
								<div class="h-8 w-64 rounded-md bg-slate-100 dark:bg-slate-800"></div>
							</div>
						</div>
						<div class="space-y-4">
							{#each [1, 2, 3] as i (i)}
								<div class="rounded-lg border border-slate-100 p-4 dark:border-slate-800">
									<div class="mb-2 h-4 w-1/3 rounded bg-slate-100 dark:bg-slate-800"></div>
									<div class="h-8 w-full rounded bg-slate-50 dark:bg-slate-800/50"></div>
								</div>
							{/each}
						</div>
					</div>
				</div>
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

				<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each features as feature (feature.title)}
						<div class="group bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 dark:bg-slate-800 dark:border-slate-700 dark:hover:border-slate-600 {feature.class || ''}">
							<div class="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform dark:bg-indigo-900/50 dark:text-indigo-400">
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
			<div class="max-w-5xl mx-auto">
				<div class="text-center mb-16">
					<h2 class="text-3xl font-bold text-slate-900 mb-4 dark:text-white">Get Started in Seconds</h2>
					<p class="text-slate-600 max-w-2xl mx-auto dark:text-slate-400">
						Add the plugin to your project and start translating.
					</p>
				</div>

				<div class="grid md:grid-cols-2 gap-8 items-start">
					<!-- Install -->
					<div class="rounded-2xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-800">
						<div class="p-6 pb-2">
							<div class="flex items-center gap-3 mb-4">
								<div class="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
									<Terminal class="w-5 h-5" />
								</div>
								<h3 class="text-xl font-bold text-slate-900 dark:text-white">Installation</h3>
							</div>
							<p class="text-slate-600 mb-6 text-sm dark:text-slate-400">
								Choose your package manager
							</p>
						</div>
						
						<div class="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-[#0D1117] mx-6 mb-6">
							<div class="flex items-center justify-between border-b border-gray-200 px-4 py-2 dark:border-gray-700">
								<div class="relative">
									<select
										bind:value={selectedManager}
										class="appearance-none rounded bg-transparent py-1 pr-8 pl-2 text-sm font-medium text-gray-700 transition outline-none hover:bg-gray-200 focus:ring-2 focus:ring-indigo-500 dark:text-gray-300 dark:hover:bg-gray-700 cursor-pointer"
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
										<span class="text-green-500">Copied!</span>
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
					<div class="rounded-2xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-800">
						<div class="p-6 pb-2">
							<div class="flex items-center gap-3 mb-4">
								<div class="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600 dark:bg-violet-900/50 dark:text-violet-400">
									<Settings class="w-5 h-5" />
								</div>
								<h3 class="text-xl font-bold text-slate-900 dark:text-white">Configuration</h3>
							</div>
							<p class="text-slate-600 mb-6 text-sm dark:text-slate-400">
								Add to <code>vite.config.ts</code>
							</p>
						</div>

						<div class="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-[#0D1117] mx-6 mb-6">
							<div class="flex items-center justify-between border-b border-gray-200 px-4 py-2 dark:border-gray-700">
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
										<span class="text-green-500">Copied!</span>
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
