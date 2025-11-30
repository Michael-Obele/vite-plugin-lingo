import type { LayoutServerLoad } from './$types.js';

interface NpmPackageInfo {
	'dist-tags': {
		latest: string;
	};
}

export const load = (async ({ fetch }) => {
	let version = '0.0.2'; // fallback version

	try {
		const response = await fetch('https://registry.npmjs.org/vite-plugin-lingo', {
			headers: {
				Accept: 'application/json'
			}
		});

		if (response.ok) {
			const data: NpmPackageInfo = await response.json();
			version = data['dist-tags']?.latest ?? version;
            console.log(version);
		}
	} catch (error) {
		// If fetch fails, use fallback version
		console.warn('Failed to fetch npm version:', error);
	}

	return {
		npmVersion: version
	};
}) satisfies LayoutServerLoad;
