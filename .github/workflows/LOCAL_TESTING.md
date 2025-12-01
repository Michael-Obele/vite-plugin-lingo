# Testing GitHub Actions Workflows Locally

This guide explains how to test GitHub Actions workflows locally before pushing to GitHub.

## Prerequisites

### Install `act`

[act](https://github.com/nektos/act) is a tool that lets you run GitHub Actions locally using Docker.

**macOS:**
```bash
brew install act
```

**Linux:**
```bash
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash
```

**Using Go:**
```bash
go install github.com/nektos/act@latest
```

### Docker

You need Docker installed and running. Install Docker Desktop or Docker Engine.

## Basic Usage

### List Available Jobs

```bash
# List all workflows and jobs
act -l

# List jobs for a specific event
act push -l
act pull_request -l
```

### Run Workflows

```bash
# Run push event (default)
act

# Run specific event
act push
act pull_request
act workflow_dispatch
```

### Run Specific Job

```bash
# Run a specific job from a workflow
act -j release

# Run job from a specific workflow file
act -j release -W .github/workflows/publish-provenance.yml
```

## Testing publish-provenance.yml Locally

### Dry Run (No Actual Execution)

```bash
act push -n -W .github/workflows/publish-provenance.yml
```

### With Custom Commit Message (to trigger release)

Create an event file `test-event.json`:
```json
{
  "head_commit": {
    "message": "feat: test feature [patch]"
  }
}
```

Run with the event:
```bash
act push -e test-event.json -W .github/workflows/publish-provenance.yml
```

### With Secrets

Create a `.secrets` file (add to .gitignore!):
```
GITHUB_TOKEN=your_github_token
NPM_TOKEN=your_npm_token
```

Run with secrets:
```bash
act push --secret-file .secrets -W .github/workflows/publish-provenance.yml
```

### Using Better Docker Images

The default act image is minimal. Use larger images for better compatibility:

```bash
# Medium image (recommended)
act -P ubuntu-latest=ghcr.io/catthehacker/ubuntu:act-latest

# Full image (larger, more tools)
act -P ubuntu-latest=ghcr.io/catthehacker/ubuntu:full-latest
```

## Common act Options

| Option | Description |
|--------|-------------|
| `-l` | List all actions/jobs |
| `-n` | Dry run (don't actually run) |
| `-j <job>` | Run a specific job |
| `-W <path>` | Specify workflow file |
| `-e <file>` | Event payload file |
| `-s KEY=VALUE` | Set a secret |
| `--secret-file` | File with secrets |
| `-P <platform>=<image>` | Custom Docker image |
| `--verbose` | Verbose output |
| `-r` | Reuse containers between runs |
| `--container-architecture linux/amd64` | Force architecture |

## Testing Without Docker

### Manual Build Test

Test that your build produces the expected files:

```bash
# Run the full build
bun run build

# Verify output files exist
ls -la dist/plugin/

# Expected files:
# - index.js (ESM)
# - index.cjs (CommonJS)
# - index.d.ts (ESM types)
# - index.d.cts (CommonJS types)
```

### Test Version Bump Logic

```bash
# Get current version
node -p "require('./package.json').version"

# Test npm version (dry-run style)
npm version patch --no-git-tag-version
git checkout package.json  # Reset
```

### Test Publish (Dry Run)

```bash
# Build first
bun run build

# Dry run publish
npm publish --dry-run
```

## Troubleshooting

### "Cannot find module" Errors

Ensure you're using a suitable Docker image:
```bash
act -P ubuntu-latest=ghcr.io/catthehacker/ubuntu:act-latest
```

### Bun Not Found

The act images may not have Bun. You can:
1. Use a custom Dockerfile
2. Or test the workflow on GitHub with a non-release commit first

### Architecture Issues (Apple Silicon)

```bash
act --container-architecture linux/amd64
```

### Missing Secrets

For workflows requiring secrets, either:
1. Provide them via `--secret-file`
2. Skip steps that need secrets using `-j` to run specific jobs
3. Use `act -n` for dry run

## CI Validation Steps

Before pushing, manually verify:

1. **Build succeeds:**
   ```bash
   bun run build
   ```

2. **All expected files exist:**
   ```bash
   ls dist/plugin/index.{js,cjs,d.ts,d.cts}
   ```

3. **Publint passes:**
   ```bash
   bunx publint
   ```

4. **Package structure is correct:**
   ```bash
   bun pack --dry-run
   ```

## GitHub CLI Alternative

You can also use GitHub CLI to manually trigger workflows:

```bash
# Authenticate
gh auth login

# Manually run a workflow
gh workflow run publish-provenance.yml

# Check run status
gh run list
gh run view <run-id>
```
