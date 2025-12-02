# Testing GitHub Actions Workflows Locally with `act`

This guide explains how to test GitHub Actions workflows locally using [`act`](https://github.com/nektos/act) before pushing to GitHub.

## What is `act`?

`act` is a tool that runs your GitHub Actions locally using Docker containers. It simulates the GitHub Actions environment, allowing you to:
- Test workflows before pushing
- Debug CI/CD issues locally
- Save time and GitHub Actions minutes

## Installation

### Prerequisites

**Docker** must be installed and running:

```bash
# Ubuntu/Debian
sudo apt update && sudo apt install docker.io
sudo systemctl start docker
sudo systemctl enable docker

# Or install Docker Desktop from https://www.docker.com/products/docker-desktop
```

### Install `act`

**Linux:**
```bash
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash
```

**macOS:**
```bash
brew install act
```

**Windows:**
```bash
winget install nektos.act
# or
choco install act-cli
```

### Alternative: Install as GitHub CLI Extension

If you already have [GitHub CLI](https://cli.github.com/) installed, you can install `act` as an extension:

```bash
# Install the gh-act extension
gh extension install https://github.com/nektos/gh-act
```

After installation, use `gh act` instead of `act`:

```bash
# List workflows
gh act -l

# Dry run
gh act -n -W .github/workflows/semantic-release.yml

# Run with event
gh act push -W .github/workflows/publish-provenance.yml
```

**Benefits:**
- Easy integration with `gh auth token` for secrets
- Single tool for all GitHub interactions
- No separate installation needed if you already have `gh`

**Note:** All commands in this guide work the same way - just prefix with `gh` (e.g., `act -l` becomes `gh act -l`).

### Fix Docker Permissions (Linux)

If you get "permission denied" errors:

```bash
# Add your user to the docker group
sudo usermod -aG docker $USER

# Apply changes (or log out and back in)
newgrp docker
```

## Understanding `act -l` Output

When you run `act -l`, you'll see something like:

```
INFO[0000] Using docker host 'unix:///var/run/docker.sock', and daemon socket 'unix:///var/run/docker.sock' 
Stage  Job ID     Job name   Workflow name                      Workflow file           Events      
0      release    release    Automated Release with Provenance  publish-provenance.yml  push        
0      changelog  changelog  Release Changelog                  release-changelog.yml   workflow_run
0      release    release    Release with semantic-release      semantic-release.yml    push        

Detected multiple jobs with the same job name, use `-W` to specify the path to the specific workflow.
```

### What Each Column Means

| Column | Description |
|--------|-------------|
| **Stage** | Execution order (0 = first, 1 = second, etc.) |
| **Job ID** | The `jobs.<job_id>` from the workflow YAML |
| **Job name** | The `jobs.<job_id>.name` or defaults to Job ID |
| **Workflow name** | The `name:` at the top of the workflow file |
| **Workflow file** | The filename in `.github/workflows/` |
| **Events** | What triggers the workflow (push, pull_request, etc.) |

### "Multiple Jobs with Same Name" Warning

This warning appears when multiple workflow files have jobs with the same Job ID (e.g., "release"). This is:

- ✅ **NOT an error** - just informational
- ✅ **Normal** for projects with multiple release workflows
- ✅ **Fine for GitHub Actions** - each workflow runs independently

**Why it matters for `act`:** When you run `act` without specifying a workflow, it doesn't know which "release" job you want to run. The solution is simple - use the `-W` flag:

```bash
# Run a specific workflow
act -W .github/workflows/semantic-release.yml
```

## Basic Usage

### List All Workflows and Jobs

```bash
act -l
```

### Dry Run (Recommended First Step)

Test without actually executing - shows what would happen:

```bash
act -n -W .github/workflows/semantic-release.yml
```

### Run a Specific Workflow

```bash
# Run the semantic-release workflow
act -W .github/workflows/semantic-release.yml

# Run the publish-provenance workflow
act -W .github/workflows/publish-provenance.yml
```

### Run a Specific Job

```bash
# Run only the 'release' job from a specific workflow
act -j release -W .github/workflows/semantic-release.yml
```

### Simulate Specific Events

```bash
# Simulate a push event (default)
act push -W .github/workflows/semantic-release.yml

# Simulate a pull request
act pull_request -W .github/workflows/my-workflow.yml

# Simulate workflow_dispatch (manual trigger)
act workflow_dispatch -W .github/workflows/my-workflow.yml
```

## Advanced Usage

### Use Better Docker Images

The default `act` image is minimal. Use larger images for better compatibility:

```bash
# Recommended: Medium image with more tools
act -P ubuntu-latest=ghcr.io/catthehacker/ubuntu:act-latest -W .github/workflows/semantic-release.yml

# Full image (larger, most compatible)
act -P ubuntu-latest=ghcr.io/catthehacker/ubuntu:full-latest -W .github/workflows/semantic-release.yml
```

### Provide Secrets

Create a `.secrets` file (add to `.gitignore`!):

```
GITHUB_TOKEN=ghp_your_token_here
NPM_TOKEN=npm_your_token_here
```

Run with secrets:

```bash
act --secret-file .secrets -W .github/workflows/semantic-release.yml
```

Or inline:

```bash
act -s GITHUB_TOKEN=ghp_xxx -W .github/workflows/semantic-release.yml
```

### Custom Event Payload

Create `test-event.json`:

```json
{
  "head_commit": {
    "message": "feat: test feature [patch]"
  }
}
```

Run with custom event:

```bash
act push -e test-event.json -W .github/workflows/publish-provenance.yml
```

### Reuse Containers (Faster)

```bash
act -r -W .github/workflows/semantic-release.yml
```

### Verbose Output

```bash
act -v -W .github/workflows/semantic-release.yml
```

## Common Options Reference

| Option | Description |
|--------|-------------|
| `-l` | List all workflows and jobs |
| `-n` | Dry run (don't execute) |
| `-W <path>` | Specify workflow file |
| `-j <job>` | Run specific job |
| `-e <file>` | Event payload JSON file |
| `-s KEY=VALUE` | Set a secret |
| `--secret-file <file>` | File with secrets |
| `-P <platform>=<image>` | Custom Docker image |
| `-v` | Verbose output |
| `-r` | Reuse containers |
| `--container-architecture` | Force architecture (e.g., `linux/amd64`) |

## Testing This Project's Workflows

### Quick Validation

```bash
# List available workflows
act -l

# Dry-run semantic-release
act -n -W .github/workflows/semantic-release.yml

# Dry-run publish-provenance
act -n -W .github/workflows/publish-provenance.yml
```

### Full Local Test

```bash
# Test semantic-release workflow
act -W .github/workflows/semantic-release.yml -P ubuntu-latest=ghcr.io/catthehacker/ubuntu:act-latest
```

### Test with Release Trigger

```bash
# Create event file
echo '{"head_commit":{"message":"feat: test [patch]"}}' > /tmp/test-event.json

# Run with event
act push -e /tmp/test-event.json -W .github/workflows/publish-provenance.yml
```

## Manual Verification (No Docker)

If Docker isn't available, manually verify your build:

```bash
# Run the full build
bun run build

# Verify output files exist
ls dist/plugin/index.{js,cjs,d.ts,d.cts}

# Test publish dry-run
npm publish --dry-run
```

## Troubleshooting

### "Permission denied" for Docker

```bash
sudo usermod -aG docker $USER
newgrp docker
# Or log out and back in
```

### "Bun not found" in act

The default act images don't include Bun. Our workflows use `oven-sh/setup-bun@v2` which installs it. If issues persist, use a larger image:

```bash
act -P ubuntu-latest=ghcr.io/catthehacker/ubuntu:full-latest -W .github/workflows/semantic-release.yml
```

### Slow First Run

The first run downloads Docker images (~1-2GB). Subsequent runs are faster, especially with `-r` (reuse containers).

### Architecture Issues (Apple Silicon)

```bash
act --container-architecture linux/amd64 -W .github/workflows/semantic-release.yml
```

## GitHub CLI Options

### Option 1: Run Locally with `gh act` (Recommended)

If you installed act as a GitHub CLI extension (see [Installation](#alternative-install-as-github-cli-extension)), you can run workflows locally:

```bash
# Run workflows locally using Docker
gh act -l                                            # List workflows
gh act -n -W .github/workflows/semantic-release.yml  # Dry run
gh act push -W .github/workflows/semantic-release.yml # Full run

# Easy secret injection with gh auth
gh act -s GITHUB_TOKEN=$(gh auth token) -W .github/workflows/semantic-release.yml
```

### Option 2: Trigger on GitHub (Remote)

To trigger workflows directly on GitHub (not locally):

```bash
# Authenticate
gh auth login

# Manually trigger a workflow
gh workflow run semantic-release.yml

# Check run status
gh run list
gh run view <run-id>
```

**Key Difference:**
| Method | Execution | Docker Required | GitHub Minutes Used |
|--------|-----------|-----------------|---------------------|
| `gh act` | Local machine | Yes | No |
| `gh workflow run` | GitHub servers | No | Yes |
