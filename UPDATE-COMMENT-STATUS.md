# Update PR Comment Status - Guide

## 🎯 New Tool Added: `update_pr_comment_status`

Mark pull request comments as fixed, closed, or reactivate them after addressing reviewer feedback.

## 📋 Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pullRequestId` | number | ✅ Yes | The PR ID containing the comment |
| `threadId` | number | ✅ Yes | The comment thread ID to update |
| `status` | string | ✅ Yes | New status (see below) |
| `repository` | string | ❌ No | Repository name (uses env default if omitted) |

## 📊 Available Status Values

| Status | Description | Use Case |
|--------|-------------|----------|
| `fixed` | Mark as resolved/fixed | You've addressed the feedback |
| `active` | Reopen the thread | Need to discuss further |
| `closed` | Close the thread | Mark as done/resolved |
| `wontFix` | Won't fix | Decided not to implement |
| `byDesign` | Working as intended | This is intentional behavior |
| `pending` | Mark as pending | Will address later |

## 🔧 Usage Examples

### Example 1: Mark Comment as Fixed

After fixing a code issue mentioned in a comment:

```json
{
  "name": "update_pr_comment_status",
  "arguments": {
    "pullRequestId": 10692,
    "threadId": 72758,
    "status": "fixed"
  }
}
```

### Example 2: Reopen a Comment

Reactivate a thread for further discussion:

```json
{
  "name": "update_pr_comment_status",
  "arguments": {
    "pullRequestId": 10692,
    "threadId": 72758,
    "status": "active",
    "repository": "Bladed"
  }
}
```

### Example 3: Mark as Won't Fix

Indicate you won't implement the suggested change:

```json
{
  "name": "update_pr_comment_status",
  "arguments": {
    "pullRequestId": 10692,
    "threadId": 72758,
    "status": "wontFix"
  }
}
```

## 🔄 Typical Workflow

### 1. Get Comments from PR
```json
{
  "name": "get_pr_comments",
  "arguments": {
    "pullRequestId": 10692
  }
}
```

**Response includes thread IDs:**
```json
[
  {
    "id": 1,
    "content": "Remove this extra space",
    "threadId": 72758,
    "status": "active"
  }
]
```

### 2. Fix the Issue in Code
Make the necessary code changes based on the feedback.

### 3. Update Comment Status
```json
{
  "name": "update_pr_comment_status",
  "arguments": {
    "pullRequestId": 10692,
    "threadId": 72758,
    "status": "fixed"
  }
}
```

**Success response:**
```
Successfully updated thread 72758 status to "fixed" in PR 10692
```

## 💬 Using with Copilot

### Natural Language Examples

**"Mark the first comment in my PR as fixed"**
Copilot will:
1. Get PR comments
2. Extract the first thread ID
3. Update status to "fixed"

**"Close all comments in PR 10692"**
Copilot will:
1. Get all comments
2. Update each thread status to "closed"

**"Reopen thread 72758"**
Copilot will:
1. Update the specific thread to "active"

## 🧪 Testing

### Interactive Test
```bash
npm run test:interactive
# Select option 7 - Update PR comment status
# Follow prompts to enter PR ID, thread ID, and status
```

### Automated Test
```bash
npm run test:comment-status
```

### Manual Test with Real PR
1. Get a PR with comments: `npm run test:comment-status`
2. Note the thread IDs from the response
3. Use interactive test to update specific threads

## ⚠️ Important Notes

### Thread IDs vs Comment IDs
- Each comment belongs to a **thread**
- Update the **threadId**, not the comment ID
- Get threadId from `get_pr_comments` response

### Permissions Required
- Your PAT needs **Code (Write)** permissions
- You must have access to the repository
- Some statuses may require specific permissions

### Status Behavior
- `fixed` or `closed` - Marks thread as resolved
- `active` - Reopens a closed thread
- Status changes are visible to all PR participants

## 🔍 Troubleshooting

### Error: "Thread not found"
- Verify the thread ID exists in the PR
- Check you're using the correct PR ID
- Thread may have been deleted

### Error: "Authentication failed"
- Ensure your PAT has write permissions
- Check PAT hasn't expired
- Verify repository access

### Error: "Invalid status"
- Use exact status values (case-sensitive)
- Valid: `active`, `fixed`, `closed`, `wontFix`, `byDesign`, `pending`
- Invalid: `Fixed`, `CLOSED`, `resolve`

## 📚 Complete Tool List

Now **7 tools** available:

1. `get_current_pr` - Find PR for a branch
2. `get_pr_comments` - Get all active comments
3. `read_file_content` - Read files
4. `get_coding_patterns` - Get patterns
5. `add_coding_pattern` - Add patterns
6. `update_patterns_file` - Update patterns
7. `update_pr_comment_status` - ✨ NEW: Update comment status

## 🚀 Quick Commands

```bash
# List all tools
npm test

# Test comment status update
npm run test:comment-status

# Interactive mode
npm run test:interactive
```

---

**Pro Tip:** Use `get_pr_comments` first to see all thread IDs, then update the ones you've addressed! 🎯
