import type { IncomingMessage, ServerResponse } from 'http';
import { join } from 'path';
import {
	findPoFiles,
	parsePoFile,
	savePoFile,
	getLanguageStats,
	updateTranslation
} from './po-parser.js';
import type { Translation } from './types.js';

interface MiddlewareOptions {
	localesDir: string;
	root: string;
}

/**
 * Parse the request body as JSON
 */
async function parseBody<T>(req: IncomingMessage): Promise<T> {
	return new Promise((resolve, reject) => {
		let body = '';
		req.on('data', (chunk) => (body += chunk));
		req.on('end', () => {
			try {
				resolve(JSON.parse(body));
			} catch {
				reject(new Error('Invalid JSON'));
			}
		});
		req.on('error', reject);
	});
}

/**
 * Send JSON response
 */
function sendJson(res: ServerResponse, data: unknown, statusCode = 200): void {
	res.statusCode = statusCode;
	res.setHeader('Content-Type', 'application/json');
	res.end(JSON.stringify(data));
}

/**
 * Send error response
 */
function sendError(res: ServerResponse, message: string, statusCode = 500): void {
	sendJson(res, { success: false, error: message }, statusCode);
}

/**
 * Create API middleware for handling translation operations
 */
export function createApiMiddleware(options: MiddlewareOptions) {
	const { localesDir } = options;

	return async (req: IncomingMessage, res: ServerResponse, next: () => void): Promise<void> => {
		const url = new URL(req.url || '/', `http://${req.headers.host}`);
		const path = url.pathname;
		const method = req.method?.toUpperCase();

		// Enable CORS for development
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
		res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

		// Handle preflight
		if (method === 'OPTIONS') {
			res.statusCode = 204;
			res.end();
			return;
		}

		try {
			// GET /api/languages - List all languages with stats
			if (path === '/languages' && method === 'GET') {
				const stats = await getLanguageStats(localesDir);
				sendJson(res, { success: true, data: stats });
				return;
			}

			// GET /api/translations/:lang - Get all translations for a language
			const translationsMatch = path.match(/^\/translations\/([^/]+)$/);
			if (translationsMatch && method === 'GET') {
				const langCode = translationsMatch[1];
				const filePath = join(localesDir, `${langCode}.po`);

				try {
					const translations = await parsePoFile(filePath);
					sendJson(res, { success: true, data: translations });
				} catch (error) {
					sendError(res, `Language not found: ${langCode}`, 404);
				}
				return;
			}

			// PUT /api/translations/:lang - Update translations for a language
			if (translationsMatch && method === 'PUT') {
				const langCode = translationsMatch[1];
				const filePath = join(localesDir, `${langCode}.po`);

				try {
					const body = await parseBody<Translation | Translation[]>(req);
					const updates = Array.isArray(body) ? body : [body];
					await savePoFile(filePath, updates);
					sendJson(res, { success: true, message: 'Translations updated' });
				} catch (error) {
					sendError(res, error instanceof Error ? error.message : 'Failed to update', 400);
				}
				return;
			}

			// PUT /api/translation/:lang/:msgid - Update a single translation
			const singleMatch = path.match(/^\/translation\/([^/]+)\/(.+)$/);
			if (singleMatch && method === 'PUT') {
				const langCode = singleMatch[1];
				const msgid = decodeURIComponent(singleMatch[2]);
				const filePath = join(localesDir, `${langCode}.po`);

				try {
					const body = await parseBody<{ msgstr: string; context?: string }>(req);
					await updateTranslation(filePath, msgid, body.msgstr, body.context);
					sendJson(res, { success: true, message: 'Translation updated' });
				} catch (error) {
					sendError(res, error instanceof Error ? error.message : 'Failed to update', 400);
				}
				return;
			}

			// GET /api/search - Search translations across languages
			if (path === '/search' && method === 'GET') {
				const query = url.searchParams.get('q')?.toLowerCase() || '';
				const lang = url.searchParams.get('lang');

				const languages = await findPoFiles(localesDir);
				const results: Array<{
					lang: string;
					msgid: string;
					msgstr: string;
					context?: string;
				}> = [];

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

				sendJson(res, { success: true, data: results });
				return;
			}

			// Not found
			sendError(res, 'Not found', 404);
		} catch (error) {
			console.error('[lingo] API error:', error);
			sendError(res, error instanceof Error ? error.message : 'Internal server error');
		}
	};
}
