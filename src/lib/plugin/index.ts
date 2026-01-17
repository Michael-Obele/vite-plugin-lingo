import type { Plugin, ViteDevServer } from 'vite';
import { resolve, join, dirname } from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import sirv from 'sirv';
import type { PluginOptions } from './types.js';
import { createApiMiddleware } from './middleware.js';

// Compute __dirname for ESM (CJS already has it)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - import.meta.url works in ESM, undefined in CJS
const __filename = typeof __dirname !== 'undefined' ? '' : fileURLToPath(import.meta.url);
const __dirnameComputed = typeof __dirname !== 'undefined' ? __dirname : dirname(__filename);

// Re-export types
export type { PluginOptions, Translation, Language, LanguageStats } from './types.js';

/**
 * vite-plugin-lingo - Visual translation editor for .po files
 *
 * @example
 * ```ts
 * // vite.config.ts (default setup)
 * import { defineConfig } from 'vite';
 * import lingo from 'vite-plugin-lingo';
 *
 * export default defineConfig({
 *   plugins: [
 *     lingo({
 *       route: '/_translations',
 *       localesDir: './locales'
 *     })
 *   ]
 * });
 * ```
 *
 * @example
 * ```ts
 * // vite.config.ts (SvelteKit convention)
 * import { defineConfig } from 'vite';
 * import lingo from 'vite-plugin-lingo';
 *
 * export default defineConfig({
 *   plugins: [
 *     lingo({
 *       route: '/_translations',
 *       localesDir: './src/locales'  // Common in SvelteKit
 *     })
 *   ]
 * });
 * ```
 */
export default function lingoPlugin(options: PluginOptions = {}): Plugin {
	const { route = '/_translations', localesDir = './locales', production = false } = options;

	let root: string;
	let resolvedLocalesDir: string;

	return {
		name: 'vite-plugin-lingo',

		// Only apply in serve mode (unless production is enabled)
		apply: production ? undefined : 'serve',

		configResolved(config) {
			root = config.root;
			resolvedLocalesDir = resolve(root, localesDir);
		},

		configureServer(server: ViteDevServer) {
			// Ensure the route doesn't have trailing slash
			const cleanRoute = route.replace(/\/$/, '');

			// Find the built UI assets
			// When running from source (dev): __dirnameComputed is src/lib/plugin, UI is at dist/ui-dist
			// When running from dist (published): __dirnameComputed is dist/plugin, UI is at ../ui-dist
			let uiPath = resolve(__dirnameComputed, '../ui-dist');

			// If not found relative to __dirname, try from project root
			if (!existsSync(uiPath)) {
				uiPath = resolve(root, 'dist/ui-dist');
			}

			console.log('[lingo] Looking for UI at:', uiPath);
			console.log('[lingo] UI exists:', existsSync(uiPath));

			// Serve the editor UI if built assets exist
			if (existsSync(uiPath)) {
				console.log('[lingo] Serving built UI from:', uiPath);
				const serve = sirv(uiPath, {
					dev: true,
					single: true // SPA mode
				});

				server.middlewares.use(cleanRoute, (req, res, next) => {
					// Redirect to add trailing slash for base route (ensures relative paths work)
					// When mounted at /path, req.url is already stripped of the prefix
					// But the browser URL matters for relative path resolution
					const reqWithOriginal = req as typeof req & { originalUrl?: string };
					if (
						(req.url === '/' || req.url === '') &&
						reqWithOriginal.originalUrl &&
						!reqWithOriginal.originalUrl.endsWith('/')
					) {
						res.writeHead(302, { Location: cleanRoute + '/' });
						res.end();
						return;
					}

					// Handle favicon.ico requests with an empty response to prevent 404
					if (req.url === '/favicon.ico') {
						res.statusCode = 204;
						res.end();
						return;
					}

					// Skip API routes (handled by separate middleware)
					if (req.url?.startsWith('/api')) {
						return next();
					}

					// Serve static files with sirv
					// req.url is already stripped of the cleanRoute prefix by Connect
					serve(req, res, () => next());
				});
			} else {
				// Development mode: serve a simple placeholder
				server.middlewares.use(cleanRoute, (req, res, next) => {
					// Handle favicon.ico requests with an empty response to prevent 404
					if (req.url === '/favicon.ico') {
						res.statusCode = 204;
						res.end();
						return;
					}

					if (req.url?.startsWith('/api')) {
						return next();
					}

					res.setHeader('Content-Type', 'text/html');
					res.end(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🌍 Lingo Translation Editor</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #f5f5f5; min-height: 100vh; }
    .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
    header { background: white; padding: 1rem 2rem; border-bottom: 1px solid #e0e0e0; margin-bottom: 2rem; }
    h1 { font-size: 1.5rem; color: #333; }
    .card { background: white; border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .language { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; border-bottom: 1px solid #eee; }
    .language:last-child { border-bottom: none; }
    .progress { background: #e0e0e0; border-radius: 4px; height: 8px; width: 100px; overflow: hidden; }
    .progress-bar { background: #4caf50; height: 100%; transition: width 0.3s; }
    .loading { text-align: center; padding: 2rem; color: #666; }
    .error { color: #f44336; }
  </style>
</head>
<body>
  <header>
    <h1>🌍 Lingo Translation Editor</h1>
  </header>
  <div class="container">
    <div class="card">
      <h2 style="margin-bottom: 1rem;">Languages</h2>
      <div id="languages" class="loading">Loading...</div>
    </div>
  </div>
  <script>
    async function loadLanguages() {
      try {
        const res = await fetch('${cleanRoute}/api/languages');
        const { data, error } = await res.json();
        
        if (error) throw new Error(error);
        
        const container = document.getElementById('languages');
        if (!data || data.length === 0) {
          container.innerHTML = '<p>No .po files found in the locales directory.</p>';
          return;
        }
        
        container.innerHTML = data.map(lang => \`
          <div class="language">
            <div>
              <strong>\${lang.name}</strong>
              <span style="color: #666; margin-left: 0.5rem;">(\${lang.code})</span>
            </div>
            <div style="display: flex; align-items: center; gap: 1rem;">
              <span>\${lang.translated}/\${lang.total} translated</span>
              <div class="progress">
                <div class="progress-bar" style="width: \${lang.progress}%"></div>
              </div>
            </div>
          </div>
        \`).join('');
      } catch (err) {
        document.getElementById('languages').innerHTML = 
          '<p class="error">Error loading languages: ' + err.message + '</p>';
      }
    }
    
    loadLanguages();
  </script>
</body>
</html>
          `);
				});
			}

			// API endpoints
			server.middlewares.use(
				`${cleanRoute}/api`,
				createApiMiddleware({
					localesDir: resolvedLocalesDir,
					root
				})
			);

			// Watch .po files for changes
			const poGlob = join(resolvedLocalesDir, '**/*.po');
			server.watcher.add(poGlob);

			server.watcher.on('change', (path) => {
				if (path.endsWith('.po')) {
					// Notify connected clients via WebSocket
					server.ws.send({
						type: 'custom',
						event: 'lingo:po-updated',
						data: { path }
					});

					console.log(`[lingo] .po file updated: ${path}`);
				}
			});

			// Log startup message
			const port = server.config.server.port || 5173;
			const protocol = server.config.server.https ? 'https' : 'http';
			const host = server.config.server.host || 'localhost';
			const hostString = typeof host === 'string' ? host : 'localhost';

			// Use server.printUrls hook for better timing
			const originalPrintUrls = server.printUrls;
			server.printUrls = () => {
				originalPrintUrls?.();
				console.log(
					`  \x1b[32m➜\x1b[0m  \x1b[1mLingo:\x1b[0m ${protocol}://${hostString}:${port}${cleanRoute}`
				);
			};
		}
	};
}

// Named export for convenience
export { lingoPlugin };
