import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { parsePoFile, savePoFile } from '$lib/plugin/po-parser.js';
import { resolve, join } from 'path';
import { existsSync } from 'fs';
import type { Translation } from '$lib/plugin/types.js';

// Default locales directory - can be configured via environment variable
const LOCALES_DIR = process.env.LINGO_LOCALES_DIR || './locales';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const { lang } = params;
		const localesDir = resolve(process.cwd(), LOCALES_DIR);
		const filePath = join(localesDir, `${lang}.po`);

		if (!existsSync(filePath)) {
			return json({ success: false, error: `Language not found: ${lang}` }, { status: 404 });
		}

		const translations = await parsePoFile(filePath);
		return json({ success: true, data: translations });
	} catch (error) {
		console.error('[lingo] Error getting translations:', error);
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Failed to get translations'
			},
			{ status: 500 }
		);
	}
};

export const PUT: RequestHandler = async ({ params, request }) => {
	try {
		const { lang } = params;
		const localesDir = resolve(process.cwd(), LOCALES_DIR);
		const filePath = join(localesDir, `${lang}.po`);

		if (!existsSync(filePath)) {
			return json({ success: false, error: `Language not found: ${lang}` }, { status: 404 });
		}

		const body = await request.json();
		const updates: Translation[] = Array.isArray(body) ? body : [body];

		await savePoFile(filePath, updates);

		return json({ success: true, message: 'Translations updated' });
	} catch (error) {
		console.error('[lingo] Error updating translations:', error);
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Failed to update translations'
			},
			{ status: 400 }
		);
	}
};
