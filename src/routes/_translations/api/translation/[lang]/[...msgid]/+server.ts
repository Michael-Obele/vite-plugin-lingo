import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { updateTranslation } from '$lib/plugin/po-parser.js';
import { resolve, join } from 'path';
import { existsSync } from 'fs';

// Default locales directory - can be configured via environment variable
const LOCALES_DIR = process.env.LINGO_LOCALES_DIR || './locales';

export const PUT: RequestHandler = async ({ params, request }) => {
	try {
		const { lang, msgid: rawMsgid } = params;
		const msgid = decodeURIComponent(rawMsgid);
		const localesDir = resolve(process.cwd(), LOCALES_DIR);
		const filePath = join(localesDir, `${lang}.po`);

		if (!existsSync(filePath)) {
			return json({ success: false, error: `Language not found: ${lang}` }, { status: 404 });
		}

		const body = (await request.json()) as { msgstr: string; context?: string };

		if (!body.msgstr && body.msgstr !== '') {
			return json({ success: false, error: 'msgstr is required' }, { status: 400 });
		}

		await updateTranslation(filePath, msgid, body.msgstr, body.context);

		return json({ success: true, message: 'Translation updated' });
	} catch (error) {
		console.error('[lingo] Error updating translation:', error);
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Failed to update translation'
			},
			{ status: 400 }
		);
	}
};
