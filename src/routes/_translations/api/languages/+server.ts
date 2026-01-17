import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { getLanguageStats } from '$lib/plugin/po-parser.js';
import { resolve } from 'path';

// Default locales directory - can be configured via environment variable
const LOCALES_DIR = process.env.LINGO_LOCALES_DIR || './locales';

export const GET: RequestHandler = async () => {
	try {
		const localesDir = resolve(process.cwd(), LOCALES_DIR);
		const stats = await getLanguageStats(localesDir);
		return json({ success: true, data: stats });
	} catch (error) {
		console.error('[lingo] Error getting languages:', error);
		return json(
			{ success: false, error: error instanceof Error ? error.message : 'Failed to get languages' },
			{ status: 500 }
		);
	}
};
