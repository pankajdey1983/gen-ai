# GitHub Packages Installation Guide

## ✅ Published Successfully

**Package:** `@pankajdey1983/azure-devops-mcp-server@1.0.0`  
**Registry:** GitHub Packages  
**URL:** https://github.com/pankajdey1983/gen-ai/packages

## Installation

### Prerequisites

You need to authenticate with GitHub Packages before installing. Create a GitHub Personal Access Token (PAT) with `read:packages` scope.

### Setup Authentication

Create or update your `~/.npmrc` file (in your home directory):

```
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
@pankajdey1983:registry=https://npm.pkg.github.com
```

Replace `YOUR_GITHUB_TOKEN` with your GitHub PAT.

### Install the Package

#### Global Installation

```bash
npm install -g @pankajdey1983/azure-devops-mcp-server
```

#### Local Installation

```bash
npm install @pankajdey1983/azure-devops-mcp-server
```

#### Using npx (No Installation)

```bash
npx @pankajdey1983/azure-devops-mcp-server
```

## Configuration for MCP Clients

### Using with Claude Desktop or Other MCP Clients

Add to your MCP settings file:

```json
{
  "mcpServers": {
    "azure-devops": {
      "command": "npx",
      "args": ["@pankajdey1983/azure-devops-mcp-server"],
      "env": {
        "AZURE_DEVOPS_ORG_URL": "https://dev.azure.com/your-organization",
        "AZURE_DEVOPS_PAT": "your-personal-access-token",
        "AZURE_DEVOPS_PROJECT": "YourProjectName",
        "AZURE_DEVOPS_REPOSITORY": "YourRepositoryName"
      }
    }
  }
}
```

### If Installed Globally

```json
{
  "mcpServers": {
    "azure-devops": {
      "command": "azure-devops-mcp-server",
      "env": {
        "AZURE_DEVOPS_ORG_URL": "https://dev.azure.com/your-organization",
        "AZURE_DEVOPS_PAT": "your-personal-access-token",
        "AZURE_DEVOPS_PROJECT": "YourProjectName",
        "AZURE_DEVOPS_REPOSITORY": "YourRepositoryName"
      }
    }
  }
}
```

## GitHub Token Setup

### Create a GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a descriptive name (e.g., "npm packages")
4. Select scopes:
   - ✅ `read:packages` - Download packages from GitHub Package Registry
   - ✅ `write:packages` - Upload packages to GitHub Package Registry (if publishing)
5. Click "Generate token"
6. Copy the token immediately (you won't see it again)

### Configure npm with Token

**Option 1: User-level (Recommended)**

Edit `~/.npmrc`:
```
//npm.pkg.github.com/:_authToken=ghp_YourTokenHere
@pankajdey1983:registry=https://npm.pkg.github.com
```

**Option 2: Project-level**

Create `.npmrc` in your project:
```
//npm.pkg.github.com/:_authToken=ghp_YourTokenHere
@pankajdey1983:registry=https://npm.pkg.github.com
```

⚠️ **Important:** Don't commit `.npmrc` with tokens to version control!

## Verify Installation

After installation, verify it works:

```bash
# Check version
npm list -g @pankajdey1983/azure-devops-mcp-server

# Test the binary
azure-devops-mcp-server --help
```

## Quick Start

1. **Setup GitHub authentication:**
   ```bash
   echo "//npm.pkg.github.com/:_authToken=YOUR_TOKEN" >> ~/.npmrc
   echo "@pankajdey1983:registry=https://npm.pkg.github.com" >> ~/.npmrc
   ```

2. **Install the package:**
   ```bash
   npm install -g @pankajdey1983/azure-devops-mcp-server
   ```

3. **Configure environment variables:**
   Create `.env` file:
   ```env
   AZURE_DEVOPS_ORG_URL=https://dev.azure.com/your-org
   AZURE_DEVOPS_PAT=your-azure-devops-pat
   AZURE_DEVOPS_PROJECT=YourProject
   AZURE_DEVOPS_REPOSITORY=YourRepo
   ```

4. **Run the server:**
   ```bash
   azure-devops-mcp-server
   ```

## Usage Examples

Once configured with your MCP client:

```
# List available PR review templates
> List all PR strategy templates

# Get a specific template for guidance
> Get the Bug Fix Review template

# Review a pull request
> Get changes for PR #12345 and review using Feature Review template

# Get PR comments
> Get all comments from PR #12345

# Add custom template
> Add a security review template for authentication changes
```

## Updating

To update to the latest version:

```bash
npm update -g @pankajdey1983/azure-devops-mcp-server
```

Or install specific version:

```bash
npm install -g @pankajdey1983/azure-devops-mcp-server@1.0.0
```

## Uninstalling

```bash
npm uninstall -g @pankajdey1983/azure-devops-mcp-server
```

## Troubleshooting

### 401 Unauthorized Error

```
npm ERR! code E401
npm ERR! 401 Unauthorized - GET https://npm.pkg.github.com/@pankajdey1983/azure-devops-mcp-server
```

**Solution:** Your GitHub token is missing or invalid.
1. Verify `.npmrc` has correct token
2. Check token has `read:packages` scope
3. Regenerate token if expired

### Cannot Find Package

```
npm ERR! 404 Not Found - GET https://npm.pkg.github.com/@pankajdey1983/azure-devops-mcp-server
```

**Solution:** Ensure you have the correct registry configured:
```bash
npm config set @pankajdey1983:registry https://npm.pkg.github.com
```

### Permission Denied on Linux/Mac

```bash
sudo npm install -g @pankajdey1983/azure-devops-mcp-server
```

Or configure npm to use a different directory:
```bash
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

## Package Information

- **Name:** `@pankajdey1983/azure-devops-mcp-server`
- **Version:** 1.0.0
- **Registry:** GitHub Packages
- **Repository:** https://github.com/pankajdey1983/gen-ai
- **License:** MIT

## Features

✅ PR Strategy Templates - 5 default review templates  
✅ Comment Management - Fetch and update PR comments  
✅ Pattern Tracking - Maintain coding standards  
✅ PR Changes - View file diffs and changes  
✅ File Reading - Read workspace files  
✅ Branch Detection - Find PRs by branch name  
✅ Status Updates - Update comment thread status  

## Support

- **Issues:** https://github.com/pankajdey1983/gen-ai/issues
- **Documentation:** See README.md and PR-STRATEGY-TEMPLATES.md in the package
- **Repository:** https://github.com/pankajdey1983/gen-ai

## Advanced Configuration

### Using with Docker

```dockerfile
FROM node:18-alpine

# Setup GitHub Packages authentication
ARG GITHUB_TOKEN
RUN echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" > ~/.npmrc && \
    echo "@pankajdey1983:registry=https://npm.pkg.github.com" >> ~/.npmrc

# Install package
RUN npm install -g @pankajdey1983/azure-devops-mcp-server

# Set environment variables
ENV AZURE_DEVOPS_ORG_URL=""
ENV AZURE_DEVOPS_PAT=""
ENV AZURE_DEVOPS_PROJECT=""
ENV AZURE_DEVOPS_REPOSITORY=""

CMD ["azure-devops-mcp-server"]
```

### Using in CI/CD

Set `GITHUB_TOKEN` environment variable in your CI/CD pipeline and configure:

```yaml
- name: Install package
  run: |
    echo "//npm.pkg.github.com/:_authToken=${{ secrets.GITHUB_TOKEN }}" > ~/.npmrc
    echo "@pankajdey1983:registry=https://npm.pkg.github.com" >> ~/.npmrc
    npm install -g @pankajdey1983/azure-devops-mcp-server
```

---

**Status:** ✅ Published and Available on GitHub Packages
