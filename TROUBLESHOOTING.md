# Fixing 401 Authentication Error

## 🔴 Problem
Getting a **401 Unauthorized** error when trying to access Azure DevOps pull requests.

## ✅ Solutions

### 1. Verify Your Personal Access Token (PAT)

#### Check if your PAT is expired:
1. Go to: `https://dev.azure.com/{your-org}/_usersSettings/tokens`
2. Look for your token in the list
3. Check the expiration date

#### If expired, create a new PAT:
1. Click **"+ New Token"**
2. Name: `MCP Server Access`
3. Organization: Select your organization
4. Expiration: Choose your preference (30-90 days recommended)
5. **Scopes**: Select **"Code (Read & Write)"**
6. Click **Create**
7. **Copy the token immediately** (you won't see it again!)

### 2. Update Your Configuration

Edit `src/config.ts` and replace the PAT value:

```typescript
const personalAccessToken = process.env.AZURE_DEVOPS_PAT || 'YOUR_NEW_PAT_HERE';
```

Then rebuild:
```bash
npm run build
```

### 3. Verify Permissions

Your PAT needs these permissions:
- ✅ **Code (Read)** - Required to read repository and PRs
- ✅ **Code (Write)** - Required if updating PR comments
- ❌ Other scopes are optional

### 4. Check Configuration Values

Verify your settings in `src/config.ts`:

```typescript
const organizationUrl = 'https://dev.azure.com/dnvdsrenewables';  // ✅ Correct format
const project = 'Bladed';           // ✅ Project name (case-sensitive)
const repository = 'Bladed';        // ✅ Repository name (case-sensitive)
```

**Common mistakes:**
- ❌ `https://dnvdsrenewables.visualstudio.com` (old format)
- ✅ `https://dev.azure.com/dnvdsrenewables` (new format)
- ❌ Including `.git` in repository name
- ❌ Wrong case (Azure DevOps is case-sensitive)

### 5. Test Your Connection

Create a simple test script `test-auth.js`:

```javascript
import { config } from 'dotenv';
config();

const orgUrl = 'https://dev.azure.com/dnvdsrenewables';
const pat = 'YOUR_PAT_HERE';
const project = 'Bladed';

const authString = Buffer.from(`:${pat}`).toString('base64');

fetch(`${orgUrl}/${project}/_apis/git/repositories?api-version=7.0`, {
  headers: {
    'Authorization': `Basic ${authString}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => {
  console.log('✅ Authentication successful!');
  console.log('Repositories:', data.value.map(r => r.name));
})
.catch(err => {
  console.error('❌ Authentication failed:', err.message);
});
```

Run:
```bash
node test-auth.js
```

### 6. Alternative: Use Environment Variables

Instead of hardcoding, use environment variables:

1. Remove hardcoded values from `src/config.ts`:
```typescript
const organizationUrl = process.env.AZURE_DEVOPS_ORG_URL;
const personalAccessToken = process.env.AZURE_DEVOPS_PAT;
const project = process.env.AZURE_DEVOPS_PROJECT;
const repository = process.env.AZURE_DEVOPS_REPOSITORY;

if (!organizationUrl || !personalAccessToken || !project || !repository) {
  throw new Error('Missing required environment variables');
}
```

2. Set environment variables before running:
```powershell
$env:AZURE_DEVOPS_PAT="your-new-pat-here"
npm test
```

## 🔍 Still Having Issues?

### Check Azure DevOps Access
1. Open browser and go to: `https://dev.azure.com/dnvdsrenewables/Bladed/_git/Bladed`
2. Can you see the repository?
3. Can you see pull requests?
4. If not, you may not have access to this project

### Verify Organization Name
The organization name should match the URL you use to access Azure DevOps:
- If you go to `https://dev.azure.com/mycompany`, then org is `mycompany`
- Your current org: `dnvdsrenewables`

### Check Network/Proxy
If behind a corporate firewall:
- You may need proxy settings
- VPN might be required
- Talk to your IT department

## 📞 Quick Fix Commands

```bash
# 1. Update PAT in config
# Edit src/config.ts with new PAT

# 2. Rebuild
npm run build

# 3. Test
npm test

# 4. If still failing, check the error message
npm run test:real
```

## ✅ Success Indicators

When authentication works, you'll see:
```
✅ Server initialized with 6 tools
✅ Tool executed successfully
```

When it fails, you'll see:
```
❌ Authentication failed (401 Unauthorized)
```
