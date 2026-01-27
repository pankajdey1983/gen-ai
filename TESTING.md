# Local Testing Guide

## ✅ Your server is working!

The mock test passed successfully, which means the MCP server is properly configured and functioning.

## 🧪 Testing Options

### 1. Mock Test (No credentials needed)
Tests the server with mock data - perfect for verifying everything works:

```bash
npm test
```

**What it tests:**
- Server initialization
- Tool listing (6 tools available)
- Pattern management (reads `.pd/pattern.md`)

### 2. Real API Test (Requires Azure DevOps credentials)
Tests actual Azure DevOps integration:

**First, configure your credentials in `.env`:**
```env
AZURE_DEVOPS_ORG_URL=https://dev.azure.com/your-org
AZURE_DEVOPS_PAT=your-personal-access-token
AZURE_DEVOPS_PROJECT=YourProjectName
AZURE_DEVOPS_REPOSITORY=YourRepositoryName
```

**Then run:**
```bash
npm run test:real
```

**What it tests:**
- Finding pull request for current branch
- Fetching PR comments
- All Azure DevOps API integrations

### 3. Interactive Test Mode
Interactive CLI to test individual tools:

```bash
npm run test:interactive
```

**Features:**
- Menu-driven interface
- Test each tool individually
- See real-time request/response

## 📋 Available Tools

Your server successfully initialized with these 6 tools:

1. **get_current_pr** - Find PR for current Git branch
2. **get_pr_comments** - Fetch all active comments from a PR
3. **read_file_content** - Read files mentioned in comments
4. **get_coding_patterns** - Get patterns from `.pd/pattern.md`
5. **add_coding_pattern** - Add new coding patterns
6. **update_patterns_file** - Update entire patterns file

## 🚀 Next Steps

### Option A: Test with Real Azure DevOps
1. Edit `.env` with your actual credentials
2. Make sure you're in a Git repo with an active PR
3. Run: `npm run test:real`

### Option B: Use with GitHub Copilot

Add to your VS Code settings (`.vscode/settings.json` or user settings):

```json
{
  "github.copilot.chat.mcp.enabled": true,
  "github.copilot.chat.mcp.servers": {
    "azure-devops": {
      "command": "node",
      "args": ["w:\\AI\\Automate_PR\\dist\\index.js"],
      "env": {
        "AZURE_DEVOPS_ORG_URL": "https://dev.azure.com/your-org",
        "AZURE_DEVOPS_PAT": "your-pat-token",
        "AZURE_DEVOPS_PROJECT": "YourProject",
        "AZURE_DEVOPS_REPOSITORY": "YourRepo"
      }
    }
  }
}
```

Then in Copilot Chat, use commands like:
- "Find my current pull request"
- "Get all comments from my PR"
- "Show me the coding patterns"

## 🔍 Troubleshooting

### Server won't start
- Check that `npm run build` completes without errors
- Verify `.env` file exists and has correct format

### Can't find PR
- Ensure you're in a Git repository
- Check that your current branch has an active PR in Azure DevOps
- Verify branch names match exactly (e.g., `feature/my-branch`)

### Authentication errors
- Verify your PAT hasn't expired
- Check PAT has "Code (Read & Write)" permissions
- Confirm organization URL format: `https://dev.azure.com/org-name`

## 📝 Example Workflow

1. **Find your PR:**
   ```bash
   # Tool: get_current_pr
   # Returns: PR ID, title, status, URL
   ```

2. **Get comments:**
   ```bash
   # Tool: get_pr_comments
   # Input: PR ID from step 1
   # Returns: All active comments with file paths
   ```

3. **Read problematic files:**
   ```bash
   # Tool: read_file_content
   # Input: File path from comments
   # Returns: Full file content
   ```

4. **Document patterns:**
   ```bash
   # Tool: add_coding_pattern
   # Input: Pattern name, description, category
   # Updates: .pd/pattern.md
   ```

## 🎉 Success!

Your MCP server is ready to use. Choose your testing method above or integrate with Copilot!
