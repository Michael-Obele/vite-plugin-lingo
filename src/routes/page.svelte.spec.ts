import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

describe('/+page.svelte', () => {
	it('should render h1', async () => {
		render(Page);
		
		const heading = page.getByRole('heading', { level: 1 });
		await expect.element(heading).toBeInTheDocument();
		await expect.element(heading).toHaveTextContent('Translation management');
	});

	it('should render open editor link', async () => {
		render(Page);
		
		const link = page.getByRole('link', { name: 'Open Editor' });
		await expect.element(link).toBeInTheDocument();
		await expect.element(link).toHaveAttribute('href', '/_translations');
	});
});
