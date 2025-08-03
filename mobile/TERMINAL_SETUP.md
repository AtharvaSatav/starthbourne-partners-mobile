# Terminal Setup Guide - GitHub Upload from Replit

## Step 1: Create GitHub Repository via Terminal

**If you have GitHub CLI installed:**
```bash
# Install GitHub CLI (if not already installed)
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update && sudo apt install gh

# Login to GitHub
gh auth login

# Create repository
gh repo create starthbourne-partners-mobile --public --description "Real-time logging mobile app with critical alerts"
```

**Alternative: Create manually on GitHub.com:**
1. Go to github.com → New repository
2. Name: `starthbourne-partners-mobile`
3. Set to Public
4. Click "Create repository"

## Step 2: Initialize Git and Upload from Replit Terminal

```bash
# Navigate to mobile directory
cd mobile

# Initialize git repository
git init

# Configure git (replace with your info)
git config user.name "Your Name"
git config user.email "your-email@example.com"

# Add all files
git add .

# Create initial commit
git commit -m "Initial mobile app with GitHub Actions auto-build"

# Add remote origin (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/starthbourne-partners-mobile.git

# Create and switch to main branch
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 3: Authentication Methods

**Method A: Personal Access Token (Recommended)**
1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token with repo permissions
3. Use token as password when prompted:
```bash
Username: your-github-username
Password: ghp_your-personal-access-token
```

**Method B: SSH Key (Alternative)**
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your-email@example.com"

# Copy public key
cat ~/.ssh/id_ed25519.pub

# Add to GitHub → Settings → SSH Keys
# Then use SSH URL instead:
git remote set-url origin git@github.com:YOUR_USERNAME/starthbourne-partners-mobile.git
```

## Step 4: Verify Upload and Build

```bash
# Check remote URL
git remote -v

# Check status
git status

# View commit history
git log --oneline
```

**Then check GitHub:**
1. Go to your repository on GitHub
2. Actions tab → Should see "Build Android APK" running
3. Wait 5-8 minutes for build completion
4. Releases tab → Download APK

## Step 5: Future Updates

```bash
# Make changes to your code
# Then update GitHub:

cd mobile
git add .
git commit -m "Update mobile app features"
git push

# This triggers automatic APK build
```

## Troubleshooting

**Permission denied (publickey):**
```bash
# Use HTTPS instead of SSH
git remote set-url origin https://github.com/YOUR_USERNAME/starthbourne-partners-mobile.git
```

**Authentication failed:**
```bash
# Clear stored credentials
git config --global --unset user.password
# Try push again and enter personal access token
```

**Files too large:**
```bash
# Check file sizes
find . -size +100M -ls

# Remove large files if any
git rm --cached large-file.ext
echo "large-file.ext" >> .gitignore
```

## Quick Commands Summary

```bash
cd mobile
git init
git config user.name "Your Name"
git config user.email "your@email.com"
git add .
git commit -m "Initial mobile app commit"
git remote add origin https://github.com/YOUR_USERNAME/starthbourne-partners-mobile.git
git branch -M main
git push -u origin main
```

That's it! Your mobile app will be uploaded and auto-build will start immediately.