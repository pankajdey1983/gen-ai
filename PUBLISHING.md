# Publishing and Installation Guide

## Package Information

- **Package Name:** `@pankajdey1983/azure-devops-mcp-server`
- **Version:** 1.0.0
- **Registry:** npm
- **License:** MIT

## Publishing to npm

### 1. Login to npm

```bash
npm login
```

Enter your npm credentials when prompted.

### 2. Publish the Package

```bash
npm publish --access public
```

Note: The `--access public` flag is required for scoped packages (@username/package-name) to be publicly available.

### 3. Verify Publication

```bash
npm view @pankajdey1983/azure-devops-mcp-server
```

## Installation

### Install from npm

```bash
npm install -g @pankajdey1983/azure-devops-mcp-server
```

Or install locally in a project:

```bash
npm install @pankajdey1983/azure-devops-mcp-server
```

### Install from GitHub (Alternative)

```bash
npm install -g git+https://github.com/pankajdey1983/gen-ai.git
```

### Install from Local Tarball

```bash
# Create tarball
npm pack

# Install from tarball
npm install -g pankajdey1983-azure-devops-mcp-server-1.0.0.tgz
```

## Configuration

### For MCP Clients (Claude Desktop, etc.)

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

### Using Global Installation

If installed globally:

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

### Using with .env File

Create a `.env` file in your project:

```env
AZURE_DEVOPS_ORG_URL=https://dev.azure.com/your-organization
AZURE_DEVOPS_PAT=your-personal-access-token
AZURE_DEVOPS_PROJECT=YourProjectName
AZURE_DEVOPS_REPOSITORY=YourRepositoryName
```

Then run:

```bash
azure-devops-mcp-server
```

## Quick Start

1. **Install the package:**
   ```bash
   npm install -g @pankajdey1983/azure-devops-mcp-server
   ```

2. **Set up environment variables:**
   - Create `.env` file with Azure DevOps credentials

3. **Run the server:**
   ```bash
   azure-devops-mcp-server
   ```

4. **Use with MCP client:**
   - Configure your MCP client (Claude Desktop, etc.)
   - Ask for PR reviews with strategy templates

## Usage Examples

Once installed and configured:

```
# List available review templates
> List all PR strategy templates

# Get a specific template
> Get the Bug Fix Review template

# Review a PR
> Get changes for PR #12345 and review using Feature Review template

# Add custom template
> Add a security review template for reviewing auth changes
```

## Updating

To update to the latest version:

```bash
npm update -g @pankajdey1983/azure-devops-mcp-server
```

Or for specific version:

```bash
npm install -g @pankajdey1983/azure-devops-mcp-server@latest
```

## Uninstalling

```bash
npm uninstall -g @pankajdey1983/azure-devops-mcp-server
```

## Versioning

This package follows [Semantic Versioning](https://semver.org/):
- **MAJOR** version for incompatible API changes
- **MINOR** version for new functionality (backwards compatible)
- **PATCH** version for bug fixes (backwards compatible)

## Package Contents

The published package includes:
- Compiled JavaScript in `dist/`
- TypeScript type definitions
- README and documentation
- PR Strategy Templates documentation
- LICENSE file

## Development Installation

For contributing or development:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/pankajdey1983/gen-ai.git
   cd gen-ai/Automate_PR
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build:**
   ```bash
   npm run build
   ```

4. **Link locally:**
   ```bash
   npm link
   ```

## Troubleshooting

### Command not found after global install

Ensure npm global bin is in your PATH:

```bash
# Check npm global bin location
npm config get prefix

# Add to PATH (Windows)
# Add the path to your environment variables

# Add to PATH (Linux/Mac)
export PATH=$PATH:$(npm config get prefix)/bin
```

### Permission errors on Linux/Mac

Use `sudo` or fix npm permissions:

```bash
sudo npm install -g @pankajdey1983/azure-devops-mcp-server
```

Or configure npm to use a different directory:
https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally

### Module not found errors

Ensure all dependencies are installed:

```bash
npm install
npm run build
```

## Support

- **Issues:** https://github.com/pankajdey1983/gen-ai/issues
- **Documentation:** See README.md and PR-STRATEGY-TEMPLATES.md

## License

MIT - See LICENSE file for details
