# Repository Parameter Update - Summary

## ✅ Changes Made

### 1. Tool Updates

Both tools now require `repository` as an input parameter:

#### **`get_current_pr`**
- **Required Parameters:**
  - `branchName` - Branch name to find PR for
  - `repository` - Repository name in Azure DevOps

#### **`get_pr_comments`**
- **Required Parameters:**
  - `pullRequestId` - PR ID to get comments from
  - `repository` - Repository name in Azure DevOps

### 2. Git Command Instructions

Each tool now includes instructions in the parameter description on how to get the repository name:

**Command to get repository from git:**
```bash
git remote get-url origin | grep -oP '(?<=/)([^/]+)(?=\.git|$)' | tail -1
```

Or in PowerShell:
```powershell
(git remote get-url origin).Split('/')[-1].Replace('.git', '')
```

### 3. Dynamic Repository Support

The MCP server now creates a new Azure DevOps service instance with the provided repository for each request, allowing you to:
- Query PRs from different repositories without reconfiguration
- Switch between repositories dynamically
- Work with multiple repositories in the same session

## 📚 Documentation

Created `GIT-COMMANDS.md` with comprehensive instructions:
- How to extract repository name from git remote
- Platform-specific commands (Windows/Linux/Mac)
- Automated scripts
- Integration examples with Copilot
- Troubleshooting guide

## 🧪 Testing

Updated all test files:
- **`test-local.js`**: Now prompts for repository name
- **`test-comprehensive.js`**: Includes repository in test cases
- All tests passing with new parameter structure

## 📖 Usage Examples

### Example 1: Get PR for a Branch
```json
{
  "name": "get_current_pr",
  "arguments": {
    "branchName": "development/Trevor/my-feature",
    "repository": "Bladed"
  }
}
```

### Example 2: Get PR Comments
```json
{
  "name": "get_pr_comments",
  "arguments": {
    "pullRequestId": 10692,
    "repository": "Bladed"
  }
}
```

### Example 3: Using with Copilot

Ask Copilot:
```
Get my repository name from git and find the PR for branch "feature/my-branch"
```

Copilot will:
1. Run `git remote get-url origin`
2. Extract repository name (e.g., "Bladed")
3. Call `get_current_pr` with both parameters

## 🔄 Migration from Previous Version

**Before:**
```json
{
  "name": "get_current_pr",
  "arguments": {
    "branchName": "feature/my-branch"
  }
}
```

**After:**
```json
{
  "name": "get_current_pr",
  "arguments": {
    "branchName": "feature/my-branch",
    "repository": "Bladed"  // ← New required parameter
  }
}
```

## 💡 Benefits

1. **Multi-Repository Support**: Work with multiple repositories without server restart
2. **Explicit Configuration**: No ambiguity about which repository is being queried
3. **Flexible**: Can query any repository in your Azure DevOps project
4. **Git Integration**: Easy to extract from existing git configuration

## 🚀 Quick Start

1. **Get your repository name:**
   ```powershell
   git remote get-url origin
   # Extract the repository name from the URL
   ```

2. **Rebuild the server:**
   ```bash
   npm run build
   ```

3. **Test interactively:**
   ```bash
   npm run test:interactive
   # Follow prompts to enter branch name and repository
   ```

4. **Use with Copilot:**
   - Configure MCP server in VS Code settings
   - Ask Copilot to get repository name and find PRs

See `GIT-COMMANDS.md` for detailed instructions on extracting repository names! 🎯
