# 📦 Publishing Guide for vite-plugin-lingo

This guide covers how to publish and update the `vite-plugin-lingo` package on npm.

## 📋 Prerequisites

Before publishing, ensure you have:

1. **Node.js** (v18 or higher) installed
2. **npm** account - [Create one at npmjs.com](https://www.npmjs.com/signup)
3. **npm CLI** logged in (see below)
4. **Git** with clean working directory (no uncommitted changes)

## 🔐 Authentication

### First-time Setup

```bash
# Login to npm (you'll be prompted for credentials)
npm login

# Verify you're logged in
npm whoami
```

### Using npm Access Tokens (Recommended for CI/CD)

1. Go to [npmjs.com](https://www.npmjs.com/) → Account → Access Tokens
2. Generate a new **Automation** token
3. Store it securely (e.g., as a GitHub Secret `NPM_TOKEN`)

## 🚀 Publishing for the First Time

### 1. Verify Package Configuration

```bash
# Check what files will be published
npm pack --dry-run

# Run publint to check for issues
bun run build
```

### 2. Publish the Package

```bash
# For public packages (default for this project)
npm publish

# If you get a 403 error for scoped packages, use:
npm publish --access public
```

### 3. Verify Publication

```bash
# Check the package on npm
npm view vite-plugin-lingo

# Or visit: https://www.npmjs.com/package/vite-plugin-lingo
```

## 🔄 Updating the Package

### Version Bumping

npm follows [Semantic Versioning (semver)](https://semver.org/):

- **Patch** (`x.x.X`) - Bug fixes, no breaking changes
- **Minor** (`x.X.0`) - New features, backwards compatible
- **Major** (`X.0.0`) - Breaking changes

```bash
# Bump patch version (0.0.1 → 0.0.2)
npm version patch

# Bump minor version (0.0.2 → 0.1.0)
npm version minor

# Bump major version (0.1.0 → 1.0.0)
npm version major

# Specific version
npm version 1.2.3

# Prerelease versions
npm version prerelease --preid=beta  # 1.0.0 → 1.0.1-beta.0
npm version prepatch --preid=alpha   # Creates alpha version
```

### Publishing the Update

```bash
# Version bump automatically creates a git tag
npm version patch

# Push the version commit and tag
git push && git push --tags

# Publish the new version
npm publish
```

### One-liner for Quick Patches

```bash
npm version patch && git push && git push --tags && npm publish
```

## 📝 Pre-publish Checklist

Before every release, verify:

- [ ] All tests pass: `bun run test`
- [ ] Code lints correctly: `bun run lint`
- [ ] Build succeeds: `bun run build`
- [ ] `publint` passes (runs automatically with build)
- [ ] README.md is up to date
- [ ] CHANGELOG is updated (if you maintain one)
- [ ] Git working directory is clean
- [ ] You're on the correct branch (usually `main`)

## 🏷️ Managing Tags and Versions

### Dist Tags

```bash
# Publish as latest (default)
npm publish

# Publish as beta
npm publish --tag beta

# Publish as next
npm publish --tag next

# Users can then install specific tags:
# npm install vite-plugin-lingo@beta
```

### Deprecating Versions

```bash
# Deprecate a specific version
npm deprecate vite-plugin-lingo@0.0.1 "Critical bug, please upgrade"

# Deprecate all versions matching a range
npm deprecate "vite-plugin-lingo@<1.0.0" "Pre-release versions"
```

### Unpublishing (Use with Caution!)

```bash
# Unpublish a specific version (within 72 hours of publish)
npm unpublish vite-plugin-lingo@0.0.1

# Unpublish entire package (rarely needed)
npm unpublish vite-plugin-lingo --force
```

⚠️ **Warning:** Unpublishing can break projects depending on your package. Use deprecation instead when possible.

## 🔧 Troubleshooting

### Common Issues

#### "npm ERR! 403 Forbidden"

- Ensure you're logged in: `npm whoami`
- For scoped packages, use: `npm publish --access public`
- Check if the package name is available: `npm view <package-name>`

#### "npm ERR! 402 Payment Required"

- You're trying to publish a private package without a paid npm account
- Use `--access public` or upgrade your npm plan

#### "npm ERR! You cannot publish over the previously published versions"

- You need to bump the version number before publishing
- Run `npm version patch` (or minor/major)

#### Build Errors

```bash
# Clean and rebuild
rm -rf dist node_modules
bun install
bun run build
```

#### Publint Errors

Run `bunx publint` to see detailed issues with your package configuration.

### Verifying Your Package Locally

```bash
# Create a tarball
npm pack

# Install it in another project to test
cd /path/to/test-project
npm install /path/to/vite-plugin-lingo/vite-plugin-lingo-0.0.1.tgz
```

## 🤖 CI/CD Publishing (GitHub Actions)

Create `.github/workflows/publish.yml`:

```yaml
name: Publish to npm

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write
    steps:
      - uses: actions/checkout@v4
      
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest
      
      - run: bun install
      - run: bun run build
      - run: bun run test
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
      
      - run: npm publish --provenance --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Setting up npm Provenance (Recommended)

npm provenance links your package to its source repository, increasing trust:

1. Enable in `package.json`:
   ```json
   {
     "publishConfig": {
       "access": "public",
       "provenance": true
     }
   }
   ```

2. Publish from GitHub Actions with `--provenance` flag

## 📚 Additional Resources

- [npm Documentation](https://docs.npmjs.com/)
- [Semantic Versioning](https://semver.org/)
- [publint](https://publint.dev/) - Lint your package for common issues
- [arethetypeswrong](https://arethetypeswrong.github.io/) - Check TypeScript exports

---

## Quick Reference

| Action | Command |
|--------|---------|
| Login to npm | `npm login` |
| Check logged in user | `npm whoami` |
| Build package | `bun run build` |
| Dry-run pack | `npm pack --dry-run` |
| Bump patch version | `npm version patch` |
| Bump minor version | `npm version minor` |
| Bump major version | `npm version major` |
| Publish | `npm publish` |
| View package info | `npm view vite-plugin-lingo` |
