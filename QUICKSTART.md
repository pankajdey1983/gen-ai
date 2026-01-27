# Quick Reference - Azure DevOps MCP Server

## 🚀 Quick Start

```bash
# Install and build
npm install
npm run build

# Test without credentials
npm test

# Test with real Azure DevOps (edit .env first)
npm run test:real
```

## 🔧 Configuration (.env)

```env
AZURE_DEVOPS_ORG_URL=https://dev.azure.com/your-org
AZURE_DEVOPS_PAT=your-personal-access-token
AZURE_DEVOPS_PROJECT=YourProjectName
AZURE_DEVOPS_REPOSITORY=YourRepositoryName
```

## 📚 MCP Tools

| Tool | Purpose | Requires Azure DevOps |
|------|---------|---------------------|
| `get_current_pr` | Find PR for current branch | ✅ Yes |
| `get_pr_comments` | Get all active PR comments | ✅ Yes |
| `read_file_content` | Read workspace files | ❌ No |
| `get_coding_patterns` | Read .pd/pattern.md | ❌ No |
| `add_coding_pattern` | Add new pattern | ❌ No |
| `update_patterns_file` | Update patterns file | ❌ No |

## 💬 Copilot Usage Examples

```
Find my current pull request

Get all comments from PR #123

Read the file src/auth/login.ts mentioned in the comments

Show me our coding patterns

Add a new pattern: Always use async/await for database operations, category: Best Practices
```

## 🔑 Azure DevOps PAT Setup

1. Go to: `https://dev.azure.com/{your-org}/_usersSettings/tokens`
2. Click "New Token"
3. Select scopes: **Code (Read & Write)**
4. Copy token to `.env` file

## 📁 Project Structure

```
w:\AI\Automate_PR\
├── src/                    # TypeScript source
│   ├── index.ts           # MCP server entry
│   ├── azure-devops-service.ts
│   ├── pattern-manager.ts
│   └── types.ts
├── dist/                  # Compiled JavaScript
├── .pd/
│   └── pattern.md        # Coding patterns
├── .env                  # Your credentials
└── test-*.js            # Test scripts
```

## ✅ Test Results

**Mock Test Passed:**
- ✅ Server initialization
- ✅ 6 tools registered
- ✅ Pattern file accessible

## 🎯 Next Steps

1. ✅ Server is built and working
2. ⏳ Edit `.env` with your credentials
3. ⏳ Test with real Azure DevOps: `npm run test:real`
4. ⏳ Add to VS Code MCP settings (see README.md)
5. ⏳ Use with GitHub Copilot!
