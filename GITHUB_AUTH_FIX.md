# GitHub Authentication Fix

## The Problem
GitHub no longer accepts passwords for Git operations. You need a Personal Access Token (PAT).

## Quick Fix Steps

### Step 1: Create Personal Access Token
1. Go to **GitHub.com** → Sign in
2. Click your **profile picture** (top right) → **Settings**
3. Scroll down to **Developer settings** (left sidebar, bottom)
4. Click **Personal access tokens** → **Tokens (classic)**
5. Click **Generate new token** → **Generate new token (classic)**
6. Fill out the form:
   - **Note**: "Replit BeepStream APK builds"
   - **Expiration**: 90 days (or No expiration)
   - **Scopes**: Check ✅ **repo** (full control of private repositories)
7. Click **Generate token**
8. **COPY THE TOKEN** immediately (you won't see it again!)

### Step 2: Update Git Remote
```bash
# Remove old remote
git remote remove origin

# Add new remote with token
git remote add origin https://YOUR_TOKEN@github.com/AtharvaSatav/beepstream-mobile.git

# Push with token
git push -u origin main
```

### Step 3: Alternative - Use Token as Password
When Git asks for credentials:
- **Username**: AtharvaSatav
- **Password**: [paste your token here]

## Example Commands

Replace `YOUR_TOKEN` with the token you copied:

```bash
# Method 1: Direct URL with token
git remote add origin https://ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@github.com/AtharvaSatav/beepstream-mobile.git

# Method 2: Use git credential helper
git config --global credential.helper store
git push -u origin main
# Enter username: AtharvaSatav
# Enter password: [paste token]
```

## Token Security
- Keep your token private
- Don't share it in public
- Set expiration date for security
- You can revoke it anytime in GitHub settings

After authentication succeeds, GitHub Actions will automatically build your APK within 10-15 minutes.