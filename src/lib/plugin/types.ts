/**
 * Plugin configuration options
 */
export interface PluginOptions {
	/** Route where editor is served (default: '/_translations') */
	route?: string;

	/** Path to .po files directory */
	localesDir?: string;

	/** Enable in production mode (premium) */
	production?: boolean;

	/** License key for premium features */
	licenseKey?: string;

	/** AI configuration (premium) */
	ai?: {
		provider: 'openai' | 'anthropic' | 'google';
		apiKey?: string;
	};
}

/**
 * Represents a single translation entry
 */
export interface Translation {
	msgid: string;
	msgstr: string;
	context?: string;
	comments?: {
		reference?: string;
		translator?: string;
		extracted?: string;
		flag?: string;
	};
	fuzzy?: boolean;
}

/**
 * Represents a language with its translations
 */
export interface Language {
	code: string;
	name: string;
	path: string;
	translations: Translation[];
	progress: {
		total: number;
		translated: number;
		fuzzy: number;
	};
}

/**
 * API response types
 */
export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	error?: string;
}

/**
 * Language stats for the overview
 */
export interface LanguageStats {
	code: string;
	name: string;
	total: number;
	translated: number;
	fuzzy: number;
	untranslated: number;
	progress: number;
}
