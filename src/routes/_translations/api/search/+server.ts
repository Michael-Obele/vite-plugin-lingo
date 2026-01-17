import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { findPoFiles } from '$lib/plugin/po-parser.js';
import { resolve } from 'path';

// Default locales directory - can be configured via environment variable
const LOCALES_DIR = process.env.LINGO_LOCALES_DIR || './locales';

interface SearchResult {
	lang: string;
	msgid: string;
	msgstr: string;
	context?: string;
}

export const GET: RequestHandler = async ({ url }) => {
	try {
		const query = url.searchParams.get('q')?.toLowerCase() || '';
		const lang = url.searchParams.get('lang');

		const localesDir = resolve(process.cwd(), LOCALES_DIR);
		const languages = await findPoFiles(localesDir);
		const results: SearchResult[] = [];

		for (const language of languages) {
			if (lang && language.code !== lang) continue;

			for (const t of language.translations) {
				if (t.msgid.toLowerCase().includes(query) || t.msgstr.toLowerCase().includes(query)) {
					results.push({
						lang: language.code,
						msgid: t.msgid,
						msgstr: t.msgstr,
						context: t.context
					});
				}
			}
		}

		return json({ success: true, data: results });
	} catch (error) {
		console.error('[lingo] Error searching translations:', error);
		return json(
			{ success: false, error: error instanceof Error ? error.message : 'Search failed' },
			{ status: 500 }
		);
	}
};
