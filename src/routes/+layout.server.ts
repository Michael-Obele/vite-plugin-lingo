import type { LayoutServerLoad } from './$types.js';

interface NpmPackageInfo {
	'dist-tags': {
		latest: string;
	};
}

export const load = (async ({ fetch }) => {
	let version = '0.0.2'; // fallback version

	try {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 5000); // 5 second timeout for npm version check

		const response = await fetch('https://registry.npmjs.org/vite-plugin-lingo', {
			headers: {
				Accept: 'application/json'
			},
			signal: controller.signal
		});

		clearTimeout(timeout);

		if (response.ok) {
			const data: NpmPackageInfo = await response.json();
			version = data['dist-tags']?.latest ?? version;
			console.log(version);
		}
	} catch (error) {
		// If fetch fails, use fallback version
		if (error instanceof Error && error.name !== 'AbortError') {
			console.warn('Failed to fetch npm version:', error);
		}
	}

	return {
		npmVersion: version
	};
}) satisfies LayoutServerLoad;
