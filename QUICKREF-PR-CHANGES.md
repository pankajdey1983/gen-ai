# Quick Reference: Get PR Changes

## Command
```bash
npm run test:pr-changes
```

## MCP Tool
```json
{
  "name": "get_pr_changes",
  "arguments": {
    "pullRequestId": 10692
  }
}
```

## What You Get
- ✅ Total count of changed files
- ✅ Change type for each file (ADD/EDIT/DELETE/RENAME)
- ✅ Full file paths
- ✅ Original paths (for renamed files)

## Common Workflows

### 1. Review All Changes
```
Step 1: get_current_pr        → Get PR ID
Step 2: get_pr_changes        → See all files changed
Step 3: read_file_content     → Read specific files
```

### 2. Complete PR Review
```
Step 1: get_pr_changes        → See what changed
Step 2: get_pr_comments       → Get reviewer feedback
Step 3: read_file_content     → Examine commented files
Step 4: update_pr_comment_status → Mark as fixed
```

### 3. Pre-Merge Check
```
Step 1: get_pr_changes        → List all changes
Step 2: Verify file count matches expectations
Step 3: Check for unexpected deletions
Step 4: Approve if all looks good
```

## Change Types

| Icon | Type | Meaning |
|------|------|---------|
| 📝 ADD | New file added |
| 📝 EDIT | File modified |
| 📝 DELETE | File removed |
| 📝 RENAME | File moved/renamed |

## Example Output
```
File Changes for PR 10692:

Total files changed: 22

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 EDIT: /src/Service/MyService.cs
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 ADD: /src/Models/NewModel.cs
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 RENAME: /src/Utils/Helper.cs
   Original: /src/Utils/OldHelper.cs
```

## Interactive Test Menu
```bash
npm run test:interactive
# Select: 8 - Get PR file changes
# Enter: PR ID (e.g., 10692)
# Enter: Repository (or press Enter for default)
```

## Troubleshooting

**No changes found?**
- Check PR ID is correct
- Verify repository name
- Ensure PR has commits

**Authentication error?**
- Check PAT is valid
- Verify PAT has "Code (Read)" permission
- Update PAT in config.ts if expired

## Use with Copilot
Simply ask:
- "Get all file changes for PR 10692"
- "Show me what files changed in the current PR"
- "List all modifications in PR #10692"

Copilot will automatically use the `get_pr_changes` tool!
