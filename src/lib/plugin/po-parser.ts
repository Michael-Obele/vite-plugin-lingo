import { po } from 'gettext-parser';
import { readFile, writeFile, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, basename } from 'path';
import type { Translation, Language, LanguageStats } from './types.js';

/**
 * Parse a .po file and extract translations
 */
export async function parsePoFile(filePath: string): Promise<Translation[]> {
	if (!existsSync(filePath)) {
		throw new Error(`File not found: ${filePath}`);
	}

	const content = await readFile(filePath);
	const parsed = po.parse(content);

	const translations: Translation[] = [];

	for (const [context, messages] of Object.entries(parsed.translations)) {
		for (const [msgid, data] of Object.entries(messages as Record<string, unknown>)) {
			if (!msgid) continue; // Skip header entry

			const entry = data as {
				msgid: string;
				msgstr?: string[];
				comments?: {
					reference?: string;
					translator?: string;
					extracted?: string;
					flag?: string;
				};
			};

			translations.push({
				msgid,
				msgstr: entry.msgstr?.[0] || '',
				context: context || undefined,
				comments: entry.comments,
				fuzzy: entry.comments?.flag?.includes('fuzzy') || false
			});
		}
	}

	return translations;
}

/**
 * Save translations back to a .po file
 */
export async function savePoFile(filePath: string, updates: Translation[]): Promise<void> {
	if (!existsSync(filePath)) {
		throw new Error(`File not found: ${filePath}`);
	}

	const content = await readFile(filePath);
	const parsed = po.parse(content);

	for (const update of updates) {
		const context = update.context || '';

		if (parsed.translations[context]?.[update.msgid]) {
			parsed.translations[context][update.msgid].msgstr = [update.msgstr];

			// Handle fuzzy flag
			if (update.fuzzy !== undefined) {
				const comments = parsed.translations[context][update.msgid].comments || {};
				if (update.fuzzy) {
					comments.flag = 'fuzzy';
				} else {
					delete comments.flag;
				}
				parsed.translations[context][update.msgid].comments = comments;
			}
		}
	}

	const compiled = po.compile(parsed);
	await writeFile(filePath, compiled);
}

/**
 * Update a single translation
 */
export async function updateTranslation(
	filePath: string,
	msgid: string,
	msgstr: string,
	context?: string
): Promise<void> {
	await savePoFile(filePath, [{ msgid, msgstr, context }]);
}

/**
 * Find all .po files in a directory
 */
export async function findPoFiles(localesDir: string): Promise<Language[]> {
	if (!existsSync(localesDir)) {
		return [];
	}

	const files = (await readdir(localesDir)).filter((f) => f.endsWith('.po'));

	return Promise.all(
		files.map(async (file) => {
			const filePath = join(localesDir, file);
			const code = basename(file, '.po');
			const translations = await parsePoFile(filePath);

			const translated = translations.filter((t) => t.msgstr && !t.fuzzy).length;
			const fuzzy = translations.filter((t) => t.fuzzy).length;

			return {
				code,
				name: getLanguageName(code),
				path: filePath,
				translations,
				progress: {
					total: translations.length,
					translated,
					fuzzy
				}
			};
		})
	);
}

/**
 * Get language statistics for all languages
 */
export async function getLanguageStats(localesDir: string): Promise<LanguageStats[]> {
	const languages = await findPoFiles(localesDir);

	return languages.map((lang) => ({
		code: lang.code,
		name: lang.name,
		total: lang.progress.total,
		translated: lang.progress.translated,
		fuzzy: lang.progress.fuzzy,
		untranslated: lang.progress.total - lang.progress.translated - lang.progress.fuzzy,
		progress:
			lang.progress.total > 0
				? Math.round((lang.progress.translated / lang.progress.total) * 100)
				: 0
	}));
}

/**
 * Get a human-readable language name from a locale code
 */
export function getLanguageName(code: string): string {
	const names: Record<string, string> = {
		en: 'English',
		es: 'Spanish',
		fr: 'French',
		de: 'German',
		it: 'Italian',
		pt: 'Portuguese',
		'pt-BR': 'Portuguese (Brazil)',
		ja: 'Japanese',
		ko: 'Korean',
		zh: 'Chinese',
		'zh-CN': 'Chinese (Simplified)',
		'zh-TW': 'Chinese (Traditional)',
		ru: 'Russian',
		ar: 'Arabic',
		nl: 'Dutch',
		pl: 'Polish',
		sv: 'Swedish',
		da: 'Danish',
		fi: 'Finnish',
		no: 'Norwegian',
		tr: 'Turkish',
		cs: 'Czech',
		hu: 'Hungarian',
		ro: 'Romanian',
		uk: 'Ukrainian',
		vi: 'Vietnamese',
		th: 'Thai',
		id: 'Indonesian',
		ms: 'Malay',
		he: 'Hebrew',
		hi: 'Hindi'
	};
	return names[code] || code.toUpperCase();
}
