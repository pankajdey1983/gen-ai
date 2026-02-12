# Get PR File Changes Feature

## Overview

The `get_pr_changes` tool allows you to fetch all file changes (diffs) for a pull request in Azure DevOps. This is essential for code review workflows, enabling you to see what files were added, modified, deleted, or renamed in a PR.

## Tool: `get_pr_changes`

### Description
Get all file changes (diffs) for a pull request. Returns detailed information about added, modified, deleted, or renamed files.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pullRequestId` | number | Yes | The pull request ID to get file changes for |
| `repository` | string | No | Repository name in Azure DevOps (uses default from config if not provided) |

### Returns

A formatted list of file changes including:
- Total number of files changed
- For each file:
  - Change type (ADD, EDIT, DELETE, RENAME)
  - File path
  - Original path (for renamed files)
  - Change summary

## Usage Examples

### Example 1: Get Changes for a Specific PR

```json
{
  "name": "get_pr_changes",
  "arguments": {
    "pullRequestId": 10692
  }
}
```

**Response:**
```
File Changes for PR 10692:

Total files changed: 22

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 EDIT: /src/Service/MyService.cs
File: /src/Service/MyService.cs
Change Type: edit

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 ADD: /src/Models/NewModel.cs
File: /src/Models/NewModel.cs
Change Type: add

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 DELETE: /src/Legacy/OldCode.cs
File: /src/Legacy/OldCode.cs
Change Type: delete

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 RENAME: /src/Utils/Helper.cs
File: /src/Utils/Helper.cs
Change Type: rename
Original Path: /src/Utils/OldHelper.cs
```

### Example 2: With Explicit Repository

```json
{
  "name": "get_pr_changes",
  "arguments": {
    "pullRequestId": 10692,
    "repository": "MyRepository"
  }
}
```

### Example 3: No Changes Found

```json
{
  "name": "get_pr_changes",
  "arguments": {
    "pullRequestId": 99999
  }
}
```

**Response:**
```
No file changes found for PR 99999 in repository "Bladed".
```

## Typical Workflow

### 1. Find PR, Get Changes, Review Code

```bash
# Step 1: Get PR for current branch
get_current_pr { branchName: "feature/my-feature" }
# Returns: PR ID 10692

# Step 2: Get all file changes
get_pr_changes { pullRequestId: 10692 }
# Returns: List of 22 changed files with types

# Step 3: Read specific files for detailed review
read_file_content { filePath: "/src/Service/MyService.cs" }

# Step 4: Get PR comments for context
get_pr_comments { pullRequestId: 10692 }

# Step 5: Provide feedback or approval
```

### 2. Pre-Review Code Changes Analysis

```bash
# Get PR changes first to understand scope
get_pr_changes { pullRequestId: 10692 }

# Analyze by change type:
# - ADDs: New functionality, requires full review
# - EDITs: Modified code, check for regressions
# - DELETEs: Removed code, verify no dependencies
# - RENAMEs: Refactoring, check references updated
```

### 3. Integration with Comment Review

```bash
# Step 1: Get PR comments
get_pr_comments { pullRequestId: 10692 }
# Returns: Comments on specific files

# Step 2: Get all file changes for context
get_pr_changes { pullRequestId: 10692 }
# Shows which files were modified

# Step 3: Identify files with comments vs. files without
# - Files with comments: Focus review here
# - Files without comments: Check if they need review

# Step 4: Read commented files and suggest fixes
read_file_content { filePath: "/path/from/comment" }
```

## Change Types Explained

| Change Type | Icon | Description |
|-------------|------|-------------|
| **ADD** | 📝 | New file added to the repository |
| **EDIT** | 📝 | Existing file modified |
| **DELETE** | 📝 | File removed from the repository |
| **RENAME** | 📝 | File moved or renamed (original path shown) |

## Testing

### Run Automated Test

```bash
npm run test:pr-changes
```

This will:
1. Initialize the server
2. Fetch changes for PR 10692
3. Fetch changes for PR 10695
4. Display results with change counts and types

### Interactive Test

```bash
npm run test:interactive
```

Then select option **8 - Get PR file changes**:
1. Enter PR ID (e.g., `10692`)
2. Press Enter for default repository or specify custom one
3. View formatted file changes

## Use Cases

### 1. **Code Review Preparation**
Get an overview of all changes before starting a detailed review:
```json
{ "pullRequestId": 10692 }
```

### 2. **Automated Review Comments**
Use with AI/LLM to generate review feedback:
```bash
# Get changes → Read each file → Generate comments
get_pr_changes → read_file_content → add_pr_comment
```

### 3. **Change Impact Analysis**
Identify which files changed to assess impact:
- How many files modified?
- Which directories affected?
- Any critical files changed?

### 4. **Diff Summary for Reports**
Generate change summaries for PR descriptions or reports:
```bash
get_pr_changes { pullRequestId: 10692 }
# Output can be formatted into PR description
```

### 5. **Pre-Merge Validation**
Before merging, verify expected changes:
- Check file count matches expectations
- Verify no unexpected deletions
- Confirm all new files are necessary

## Troubleshooting

### Issue: "No file changes found"

**Possible Causes:**
1. PR ID doesn't exist
2. PR has no commits yet
3. Repository name is incorrect

**Solution:**
```bash
# Verify PR exists
get_current_pr { branchName: "feature/branch" }

# Check if using correct repository
get_pr_changes { pullRequestId: 10692, repository: "Bladed" }
```

### Issue: "repository parameter is required"

**Solution:**
Set environment variable or pass explicitly:
```bash
# Option 1: Set environment variable
$env:AZURE_DEVOPS_REPOSITORY = "Bladed"

# Option 2: Pass in arguments
{ "pullRequestId": 10692, "repository": "Bladed" }
```

### Issue: "Authentication error (401)"

**Solution:**
Check your Personal Access Token:
1. Verify PAT is not expired
2. Ensure PAT has "Code (Read)" permissions
3. Update PAT in config.ts or environment variable

## Performance Considerations

- **Large PRs**: PRs with 100+ files may take longer to fetch
- **Network Latency**: Azure DevOps API calls depend on network speed
- **API Rate Limits**: Multiple rapid requests may be throttled

## Best Practices

1. **Check PR Changes First**: Before detailed review, get the file list to understand scope
2. **Use with Comments**: Combine with `get_pr_comments` to prioritize review
3. **Read Files Selectively**: Don't read all files; focus on changed files only
4. **Cache Results**: If reviewing multiple times, cache the changes list
5. **Filter by Type**: Focus on ADDs and EDITs first; DELETEs usually need less review

## Related Tools

| Tool | Purpose |
|------|---------|
| `get_current_pr` | Find PR ID for a branch |
| `get_pr_comments` | Get reviewer comments |
| `read_file_content` | Read specific file contents |
| `update_pr_comment_status` | Mark comments as fixed |

## Example Integration: Full PR Review

```bash
# 1. Find the PR
get_current_pr { branchName: "feature/my-feature" }
# → PR ID: 10692

# 2. Get all file changes
get_pr_changes { pullRequestId: 10692 }
# → 22 files: 5 ADD, 15 EDIT, 1 DELETE, 1 RENAME

# 3. Get existing comments
get_pr_comments { pullRequestId: 10692 }
# → 3 active comments on 2 files

# 4. Read files with comments
read_file_content { filePath: "/src/Service/MyService.cs" }

# 5. Read new files (ADDs)
read_file_content { filePath: "/src/Models/NewModel.cs" }

# 6. Provide review feedback
# (Generate comments or suggestions)

# 7. Mark comments as addressed
update_pr_comment_status { 
  pullRequestId: 10692, 
  threadId: 72758, 
  status: "fixed" 
}
```

## API Reference

### Azure DevOps API Endpoint
```
GET https://dev.azure.com/{organization}/{project}/_apis/git/repositories/{repository}/pullRequests/{pullRequestId}/iterations
```

### Response Structure
```typescript
interface PullRequestChange {
  changeType: 'add' | 'edit' | 'delete' | 'rename';
  path: string;
  originalPath?: string;
  diff?: string;
}
```

## See Also

- [UPDATE-COMMENT-STATUS.md](./UPDATE-COMMENT-STATUS.md) - Update comment status after fixing issues
- [REPOSITORY-UPDATE.md](./REPOSITORY-UPDATE.md) - Repository parameter usage
- [TESTING.md](./TESTING.md) - Testing guidelines
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Authentication and error resolution
