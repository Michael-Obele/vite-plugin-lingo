<script lang="ts">
	import { page } from '$app/state';
	import { AlertTriangle, Home, ArrowLeft, RefreshCw } from '@lucide/svelte';
	import { fly, fade } from 'svelte/transition';
</script>

<div class="min-h-screen flex items-center justify-center px-4 py-16 bg-slate-50 dark:bg-slate-900">
	<!-- Background Blobs -->
	<div class="absolute inset-0 overflow-hidden pointer-events-none -z-10">
		<div class="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-red-200/30 dark:bg-red-900/20 blur-[120px]"></div>
		<div class="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-orange-200/30 dark:bg-orange-900/20 blur-[120px]"></div>
	</div>

	<div 
		in:fly={{ y: 20, duration: 600 }}
		class="text-center max-w-lg mx-auto"
	>
		<!-- Error Icon -->
		<div class="relative mx-auto w-24 h-24 mb-8">
			<div class="absolute inset-0 rounded-full bg-red-100 dark:bg-red-900/30 animate-pulse"></div>
			<div class="relative flex items-center justify-center w-full h-full rounded-full bg-red-50 dark:bg-red-900/50 border-2 border-red-200 dark:border-red-800">
				<AlertTriangle class="w-12 h-12 text-red-500 dark:text-red-400" />
			</div>
		</div>

		<!-- Status Code -->
		<div in:fade={{ delay: 200, duration: 400 }} class="mb-4">
			<span class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-sm font-medium border border-red-200 dark:border-red-800">
				Error {page.status}
			</span>
		</div>

		<!-- Error Title -->
		<h1 
			in:fly={{ y: 10, delay: 300, duration: 500 }}
			class="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4"
		>
			{#if page.status === 404}
				Page Not Found
			{:else if page.status === 500}
				Server Error
			{:else if page.status === 403}
				Access Denied
			{:else}
				Something Went Wrong
			{/if}
		</h1>

		<!-- Error Message -->
		<p 
			in:fly={{ y: 10, delay: 400, duration: 500 }}
			class="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed"
		>
			{#if page.status === 404}
				The page you're looking for doesn't exist or has been moved.
			{:else if page.error?.message}
				{page.error.message}
			{:else}
				An unexpected error occurred. Please try again later.
			{/if}
		</p>

		<!-- Action Buttons -->
		<div 
			in:fly={{ y: 10, delay: 500, duration: 500 }}
			class="flex flex-col sm:flex-row items-center justify-center gap-4"
		>
			<a 
				href="/"
				class="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 hover:shadow-indigo-300 dark:hover:shadow-indigo-800/50 hover:-translate-y-0.5"
			>
				<Home class="w-4 h-4" />
				Go Home
			</a>
			
			<button 
				onclick={() => history.back()}
				class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
			>
				<ArrowLeft class="w-4 h-4" />
				Go Back
			</button>

			<button 
				onclick={() => location.reload()}
				class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
			>
				<RefreshCw class="w-4 h-4" />
				Retry
			</button>
		</div>

		<!-- Helpful Links for 404 -->
		{#if page.status === 404}
			<div 
				in:fade={{ delay: 600, duration: 400 }}
				class="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700"
			>
				<p class="text-sm text-slate-500 dark:text-slate-500 mb-4">
					You might find what you're looking for here:
				</p>
				<div class="flex flex-wrap items-center justify-center gap-4 text-sm">
					<a 
						href="/" 
						class="text-indigo-600 dark:text-indigo-400 hover:underline underline-offset-2"
					>
						Home
					</a>
					<span class="text-slate-300 dark:text-slate-600">•</span>
					<a 
						href="/_translations" 
						class="text-indigo-600 dark:text-indigo-400 hover:underline underline-offset-2"
					>
						Translation Editor
					</a>
					<span class="text-slate-300 dark:text-slate-600">•</span>
					<a 
						href="https://github.com/Michael-Obele/vite-plugin-lingo" 
						target="_blank"
						rel="noopener noreferrer"
						class="text-indigo-600 dark:text-indigo-400 hover:underline underline-offset-2"
					>
						Documentation
					</a>
				</div>
			</div>
		{/if}
	</div>
</div>
