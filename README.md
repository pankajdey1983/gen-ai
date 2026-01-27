# Azure DevOps MCP Server

A Model Context Protocol (MCP) server that integrates with Azure DevOps to manage pull request comments and track coding patterns. This server enables AI assistants like GitHub Copilot to interact with Azure DevOps pull requests, analyze comments, suggest fixes, and maintain a coding patterns knowledge base.

## Features

- 🔍 **Find Pull Requests**: Automatically detect and retrieve PR information for the current branch
- 💬 **Comment Management**: Fetch all active comments from pull requests with file locations
- 📄 **File Reading**: Read file contents to understand the context of PR comments
- 📚 **Pattern Tracking**: Maintain and update coding patterns in `.pd/pattern.md`
- 🔄 **PR Changes**: Get all file changes (diffs) for a PR to review code modifications
- ✅ **Comment Status Updates**: Mark PR comments as fixed, closed, or reactivate them
- 🤖 **AI Integration**: Works seamlessly with GitHub Copilot and other MCP-compatible AI tools

## Prerequisites

- Node.js 18+ 
- TypeScript 5+
- Azure DevOps account with access to your repository
- Personal Access Token (PAT) with appropriate permissions

## Installation

1. Clone or download this repository

2. Install dependencies:
```bash
npm install
```

3. Build the TypeScript project:
```bash
npm run build
```

## Configuration

### Required Environment Variables

Create a `.env` file or set these environment variables:

```env
AZURE_DEVOPS_ORG_URL=https://dev.azure.com/your-organization
AZURE_DEVOPS_PAT=your-personal-access-token
AZURE_DEVOPS_PROJECT=YourProjectName
AZURE_DEVOPS_REPOSITORY=YourRepositoryName
```

### Azure DevOps Personal Access Token

1. Go to Azure DevOps → User Settings → Personal Access Tokens
2. Create a new token with the following scopes:
   - **Code**: Read & Write
   - **Pull Request Threads**: Read & Write
3. Copy the token and use it as `AZURE_DEVOPS_PAT`

## Usage with GitHub Copilot

### 1. Configure in VS Code Settings

Add this server to your MCP settings file (`settings.json` or MCP configuration):

```json
{
  "mcpServers": {
    "azure-devops": {
      "command": "node",
      "args": ["w:\\AI\\Automate_PR\\dist\\index.js"],
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

### 2. Start the Server

The server runs automatically when configured in your MCP settings. For manual testing:

```bash
npm start
```

## Available Tools

### `get_current_pr`
Get pull request information for the current Git branch.

**Returns:**
- PR ID, title, source/target branches
- Status, creator, and URL

**Example:**
```
Use the get_current_pr tool to find my pull request
```

### `get_pr_comments`
Retrieve all active comments from a pull request.

**Parameters:**
- `pullRequestId` (number): The PR ID

**Returns:**
- Comment content, file path, line number
- Author and thread ID

**Example:**
```
Get all comments from PR #123
```

### `read_file_content`
Read the content of a file in the workspace.

**Parameters:**
- `filePath` (string): Relative path from workspace root

**Returns:**
- Full file content

**Example:**
```
Read the file src/services/user-service.ts
```

### `get_coding_patterns`
Get all coding patterns from `.pd/pattern.md`.

**Returns:**
- Current patterns documentation

**Example:**
```
Show me the coding patterns we follow
```

### `add_coding_pattern`
Add a new coding pattern to the documentation.

**Parameters:**
- `name` (string): Pattern name
- `description` (string): Detailed description
- `category` (string): Category (e.g., "Error Handling", "Code Style")
- `example` (string, optional): Code example

**Example:**
```
Add a pattern for error handling: Always use try-catch blocks for async operations
```

### `update_patterns_file`
Update the entire patterns file with new content.

**Parameters:**
- `content` (string): Full markdown content

**Example:**
```
Update the patterns file with this reorganized content
```

### `get_pr_changes`
Get all file changes (diffs) for a pull request.

**Parameters:**
- `pullRequestId` (number): The PR ID
- `repository` (string, optional): Repository name

**Returns:**
- List of changed files with types (add/edit/delete/rename)
- File paths and change summaries
- Total count of changed files

**Example:**
```
Get all file changes for PR #10692
```

### `update_pr_comment_status`
Update the status of a pull request comment thread.

**Parameters:**
- `pullRequestId` (number): The PR ID
- `threadId` (number): The comment thread ID
- `status` (string): New status (active, fixed, closed, wontFix, byDesign, pending)
- `repository` (string, optional): Repository name

**Returns:**
- Success confirmation

**Example:**
```
Mark thread 72758 as fixed in PR 10692
```

## Workflow Example

Here's a typical workflow using this MCP server with GitHub Copilot:

1. **Find Your PR:**
   ```
   @workspace Find my current pull request
   ```

2. **Get Comments:**
   ```
   @workspace Get all active comments from my PR
   ```

3. **Analyze and Fix:**
   ```
   @workspace Review comment #5 about the authentication logic in auth.ts and suggest a fix
   ```

4. **Update Patterns:**
   ```
   @workspace Add a pattern based on this comment about using async/await properly
   ```

## Directory Structure

```
.
├── src/
│   ├── index.ts                 # Main MCP server entry point
│   ├── azure-devops-service.ts  # Azure DevOps API integration
│   ├── pattern-manager.ts       # Pattern file management
│   ├── config.ts                # Configuration loader
│   └── types.ts                 # TypeScript type definitions
├── dist/                        # Compiled JavaScript output
├── .pd/
│   └── pattern.md              # Coding patterns documentation
├── package.json
├── tsconfig.json
└── README.md
```

## Development

### Watch Mode
```bash
npm run watch
```

### Build
```bash
npm run build
```

### Testing
After building, test the server manually:
```bash
node dist/index.js
```

## Troubleshooting

### "No active pull request found"
- Ensure you're on a branch with an active PR in Azure DevOps
- Check that the branch name matches exactly (including prefixes like `feature/`)
- Verify your Azure DevOps configuration

### "Azure DevOps API not initialized"
- Check your Personal Access Token is valid and not expired
- Ensure all environment variables are set correctly
- Verify the organization URL format: `https://dev.azure.com/organization-name`

### Permission Errors
- Confirm your PAT has the required scopes (Code: Read & Write)
- Check you have access to the specified project and repository

## Security Notes

- **Never commit your PAT**: Keep it in environment variables or secure storage
- Use `.gitignore` to exclude `.env` files
- Rotate your PAT regularly
- Use minimum required permissions for your PAT

## Contributing

Contributions are welcome! Please ensure:
- Code follows TypeScript best practices
- All functions have appropriate error handling
- New features include documentation

## License

MIT

## Support

For issues related to:
- **MCP Protocol**: Check the [Model Context Protocol documentation](https://modelcontextprotocol.io)
- **Azure DevOps API**: See [Azure DevOps REST API docs](https://docs.microsoft.com/en-us/rest/api/azure/devops/)
- **This Server**: Open an issue in the repository

---

Built with ❤️ for better code reviews and pattern tracking
