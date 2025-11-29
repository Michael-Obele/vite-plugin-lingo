declare module 'gettext-parser' {
	export interface PoComment {
		translator?: string;
		reference?: string;
		extracted?: string;
		flag?: string;
		previous?: string;
	}

	export interface PoTranslation {
		msgid: string;
		msgctxt?: string;
		msgid_plural?: string;
		msgstr: string[];
		comments?: PoComment;
	}

	export interface PoTranslations {
		[context: string]: {
			[msgid: string]: PoTranslation;
		};
	}

	export interface PoData {
		charset?: string;
		headers?: Record<string, string>;
		translations: PoTranslations;
	}

	export interface ParseOptions {
		defaultCharset?: string;
		validation?: boolean;
	}

	export const po: {
		parse(buffer: Buffer | string, options?: ParseOptions): PoData;
		compile(data: PoData, options?: { foldLength?: number; sort?: boolean }): Buffer;
	};

	export const mo: {
		parse(buffer: Buffer, options?: ParseOptions): PoData;
		compile(data: PoData): Buffer;
	};
}
