# Getting Repository Name from Git

## Quick Reference

### Windows PowerShell
```powershell
# Get repository name from remote URL
git remote get-url origin | Select-String -Pattern '[^/]+(?=\.git$|$)' | ForEach-Object { $_.Matches[0].Value }

# Or simpler - just extract the last part
$url = git remote get-url origin
$url.Split('/')[-1].Replace('.git', '')
```

### Linux/Mac Bash
```bash
# Get repository name from remote URL
git remote get-url origin | grep -oP '(?<=/)([^/]+)(?=\.git|$)' | tail -1

# Or using basename
basename -s .git $(git config --get remote.origin.url)
```

### Git Remote URL Formats

Azure DevOps URLs typically look like:
```
https://dev.azure.com/organization/project/_git/RepositoryName
git@ssh.dev.azure.com:v3/organization/project/RepositoryName
```

## Step-by-Step Instructions

### 1. Get the Remote URL
```bash
git remote get-url origin
```

Example output:
```
https://dev.azure.com/dnvdsrenewables/Bladed/_git/Bladed
```

### 2. Extract Repository Name

**For Azure DevOps HTTPS URLs:**
```powershell
# PowerShell
$url = git remote get-url origin
$parts = $url.Split('/')
$repoName = $parts[-1]  # Gets "Bladed"
Write-Output $repoName
```

```bash
# Bash
url=$(git remote get-url origin)
basename "$url" .git
```

### 3. Common Patterns

| URL Format | Repository Name | Command |
|------------|----------------|---------|
| `https://dev.azure.com/org/proj/_git/Repo` | `Repo` | Last segment after `_git/` |
| `git@ssh.dev.azure.com:v3/org/proj/Repo` | `Repo` | Last segment |
| `https://github.com/user/repo.git` | `repo` | Last segment without `.git` |

## Using in MCP Tools

### Example 1: Get Current PR

```javascript
{
  "name": "get_current_pr",
  "arguments": {
    "branchName": "feature/my-feature",
    "repository": "Bladed"  // ← Extract this from git remote
  }
}
```

### Example 2: Get PR Comments

```javascript
{
  "name": "get_pr_comments",
  "arguments": {
    "pullRequestId": 10692,
    "repository": "Bladed"  // ← Extract this from git remote
  }
}
```

## Automated Scripts

### PowerShell Script
Save as `get-repo-info.ps1`:
```powershell
# Get current branch
$branch = git rev-parse --abbrev-ref HEAD

# Get repository name
$remoteUrl = git remote get-url origin
$repository = $remoteUrl.Split('/')[-1].Replace('.git', '')

# Output as JSON for easy consumption
@{
    branch = $branch
    repository = $repository
} | ConvertTo-Json

# Example output:
# {
#   "branch": "development/Trevor/my-feature",
#   "repository": "Bladed"
# }
```

Run it:
```powershell
.\get-repo-info.ps1
```

### Bash Script
Save as `get-repo-info.sh`:
```bash
#!/bin/bash

# Get current branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Get repository name
REMOTE_URL=$(git remote get-url origin)
REPOSITORY=$(basename "$REMOTE_URL" .git)

# Output as JSON
cat <<EOF
{
  "branch": "$BRANCH",
  "repository": "$REPOSITORY"
}
EOF
```

Run it:
```bash
chmod +x get-repo-info.sh
./get-repo-info.sh
```

## Integration with Copilot

When using with GitHub Copilot, you can ask:

```
Get the repository name from my git remote and use it to find the PR for branch "feature/my-branch"
```

Copilot will:
1. Run `git remote get-url origin`
2. Extract the repository name
3. Call `get_current_pr` with both parameters

## Troubleshooting

### Multiple Remotes
If you have multiple remotes:
```bash
# List all remotes
git remote -v

# Get specific remote
git remote get-url origin
git remote get-url upstream
```

### No Remote Configured
If you get an error about no remote:
```bash
# Add a remote
git remote add origin https://dev.azure.com/org/project/_git/RepoName
```

### Repository Name Has Spaces
Azure DevOps repositories can have spaces. If so:
- The URL will encode them as `%20`
- You may need to decode: `"My%20Repo"` → `"My Repo"`

In PowerShell:
```powershell
[System.Uri]::UnescapeDataString($repository)
```

## Quick Commands Reference

| Task | PowerShell | Bash |
|------|-----------|------|
| Current branch | `git rev-parse --abbrev-ref HEAD` | `git rev-parse --abbrev-ref HEAD` |
| Remote URL | `git remote get-url origin` | `git remote get-url origin` |
| Repository name | `(git remote get-url origin).Split('/')[-1].Replace('.git', '')` | `basename -s .git $(git remote get-url origin)` |
| Project name | Azure DevOps: extract from URL structure | Azure DevOps: extract from URL structure |

## Example: Complete Workflow

```powershell
# 1. Get current branch
$branch = git rev-parse --abbrev-ref HEAD
Write-Host "Branch: $branch"

# 2. Get repository
$repo = (git remote get-url origin).Split('/')[-1].Replace('.git', '')
Write-Host "Repository: $repo"

# 3. Use with MCP tool
# Now you have both parameters needed for get_current_pr:
# - branchName: $branch
# - repository: $repo
```

Output:
```
Branch: development/Trevor/workflow-version-2-validate-cli-command
Repository: Bladed
```

These values can now be used directly in your MCP tool calls! 🚀
