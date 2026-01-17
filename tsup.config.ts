import { defineConfig } from 'tsup';

export default defineConfig({
	entry: ['src/lib/plugin/index.ts'],
	outDir: 'dist/plugin',
	format: ['esm', 'cjs'],
	dts: true,
	clean: false,
	shims: true,
	sourcemap: true,
	external: ['vite', 'fs', 'path', 'url'],
	platform: 'node',
	target: 'node18',
	onSuccess: 'echo "✓ Plugin built successfully"'
});
