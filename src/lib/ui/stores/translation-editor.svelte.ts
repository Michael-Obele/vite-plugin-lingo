export type FilterValue = 'all' | 'translated' | 'untranslated' | 'fuzzy';

export interface FilterOption {
	value: FilterValue;
	label: string;
}

export const filterOptions: readonly FilterOption[] = [
	{ value: 'all', label: 'All' },
	{ value: 'translated', label: 'Translated' },
	{ value: 'untranslated', label: 'Untranslated' },
	{ value: 'fuzzy', label: 'Fuzzy' }
] as const;
