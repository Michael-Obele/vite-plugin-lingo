# 🌍 vite-plugin-lingo

A **Vite plugin** that provides a visual editor for `.po` (Gettext) translation files. Designed to work seamlessly with [wuchale](https://wuchale.dev/) and other i18n solutions.

[![npm version](https://img.shields.io/npm/v/vite-plugin-lingo.svg)](https://www.npmjs.com/package/vite-plugin-lingo)
[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

## ✨ Features

- 🎨 **Visual Translation Editor** - Browse and edit `.po` files in a beautiful web UI
- 📊 **Language Overview** - See all locales with translation progress at a glance
- 🔍 **Search & Filter** - Find translations by text, filter by status
- ⌨️ **Keyboard Shortcuts** - Ctrl+S save, arrow keys navigate
- 🔄 **HMR Support** - Live reload when `.po` files change
- 🛠️ **Framework Agnostic** - Works with React, Vue, Svelte, SolidJS, or any Vite-powered project
- 🎯 **wuchale Integration** - Auto-detect config and `.po` locations

## 📦 Installation

```bash
# npm
npm install vite-plugin-lingo --save-dev

# pnpm
pnpm add -D vite-plugin-lingo

# bun (recommended)
bun add -d vite-plugin-lingo

# yarn
yarn add -D vite-plugin-lingo
```

## 🚀 Quick Start

### 1. Add to your Vite config

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import lingo from 'vite-plugin-lingo';

export default defineConfig({
  plugins: [
    lingo({
      route: '/_translations',  // Route where editor UI is served
      localesDir: './locales',  // Path to .po files
    })
  ]
});
```

### 2. Create your locales directory

```
your-project/
├── locales/
│   ├── en.po
│   ├── es.po
│   └── fr.po
├── src/
└── vite.config.ts
```

### 3. Start your dev server

```bash
bun run dev
# or
npm run dev
```

### 4. Open the translation editor

Navigate to `http://localhost:5173/_translations` to access the visual editor.

## ⚙️ Configuration Options

```ts
lingo({
  // Route where editor UI is served (default: '/_translations')
  route: '/_translations',

  // Path to .po files relative to project root (default: './locales')
  localesDir: './locales',

  // Enable in production (default: false)
  // ⚠️ Only enable with proper authentication!
  production: false,
})
```

## 📖 API Reference

### Plugin Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `route` | `string` | `'/_translations'` | URL path where the editor is served |
| `localesDir` | `string` | `'./locales'` | Directory containing `.po` files |
| `production` | `boolean` | `false` | Enable editor in production builds |

### Exported Types

```ts
import type { 
  PluginOptions,
  Translation,
  Language,
  LanguageStats 
} from 'vite-plugin-lingo';
```

## 🔧 How It Works

```
┌─────────────────────────────────────────────────────────┐
│                    Vite Dev Server                       │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────────────────┐ │
│  │ Your App        │    │ vite-plugin-lingo           │ │
│  │ (React/Svelte/  │    │ ├─ Middleware (/_translations)│
│  │  Vue/Solid)     │    │ ├─ API (GET/PUT /api/*)     │ │
│  │                 │    │ ├─ Editor UI (Svelte SPA)   │ │
│  │                 │    │ └─ File Watcher (.po files) │ │
│  └─────────────────┘    └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  .po Files      │
                    │  └─ locales/    │
                    │     ├─ en.po    │
                    │     ├─ es.po    │
                    │     └─ fr.po    │
                    └─────────────────┘
```

## 📁 .po File Format

The plugin works with standard Gettext `.po` files:

```po
# English translations
msgid ""
msgstr ""
"Language: en\n"
"Content-Type: text/plain; charset=UTF-8\n"

#: src/components/Header.svelte:5
msgid "Welcome to our website"
msgstr "Welcome to our website"

#: src/components/Header.svelte:10
msgid "Hello, {name}!"
msgstr "Hello, {name}!"
```

## 🛠️ Development

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/Michael-Obele/vite-plugin-lingo.git
cd vite-plugin-lingo

# Install dependencies
bun install

# Start development server
bun run dev

# Build the plugin
bun run build

# Run type checking
bun run check

# Run tests
bun run test
```

### Project Structure

```
vite-plugin-lingo/
├── src/
│   ├── lib/
│   │   ├── plugin/          # Vite plugin source
│   │   │   ├── index.ts     # Main plugin entry
│   │   │   ├── middleware.ts # API endpoints
│   │   │   ├── po-parser.ts # .po file parser
│   │   │   └── types.ts     # TypeScript types
│   │   └── ui/              # Editor UI (Svelte)
│   │       ├── App.svelte   # Main editor component
│   │       └── components/  # UI components
│   └── routes/              # Demo/showcase app
├── locales/                 # Sample .po files
├── dist/                    # Built output
└── package.json
```

## 📤 Publishing to npm

### Prerequisites

1. An [npm account](https://www.npmjs.com/signup)
2. npm CLI logged in: `npm login`

### Step-by-Step Publishing Guide

```bash
# 1. Ensure you're on main branch with clean working tree
git checkout main
git pull origin main
git status  # Should be clean

# 2. Update version in package.json
# Choose appropriate version bump:
npm version patch  # 0.0.1 -> 0.0.2 (bug fixes)
npm version minor  # 0.0.1 -> 0.1.0 (new features)
npm version major  # 0.0.1 -> 1.0.0 (breaking changes)

# 3. Build and verify the package
bun run build

# 4. Preview what will be published
npm pack --dry-run

# 5. Publish to npm
npm publish --access public

# 6. Push version tag to GitHub
git push origin main --tags
```

### Verify Publication

```bash
# Check package on npm
npm view vite-plugin-lingo

# Test installation in a new project
mkdir test-install && cd test-install
npm init -y
npm install vite-plugin-lingo
```

### Troubleshooting Publishing

| Issue | Solution |
|-------|----------|
| "You must be logged in" | Run `npm login` |
| "Package name already exists" | Change `name` in `package.json` |
| "Version already exists" | Bump version with `npm version` |
| "Missing main entry" | Check `files` field includes `dist` |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

[AGPL-3.0](LICENSE) © [Michael-Obele](https://github.com/Michael-Obele)

This is a copyleft license that requires anyone who distributes your code or a derivative work to make the source available under the same terms.

## 🔗 Links

- [GitHub Repository](https://github.com/Michael-Obele/vite-plugin-lingo)
- [npm Package](https://www.npmjs.com/package/vite-plugin-lingo)
- [Issue Tracker](https://github.com/Michael-Obele/vite-plugin-lingo/issues)

---

**Made with ❤️ for the i18n community**
