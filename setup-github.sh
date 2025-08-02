#!/bin/bash

# BeepStream GitHub Repository Setup Script
# This script helps you quickly push your code to GitHub for automatic APK builds

echo "🚀 BeepStream GitHub Setup"
echo "=========================="

# Check if git is available
if ! command -v git &> /dev/null; then
    echo "❌ Git not found. Please install git first."
    exit 1
fi

# Get user input
echo ""
read -p "Enter your GitHub username: " GITHUB_USERNAME
read -p "Enter repository name [beepstream-mobile]: " REPO_NAME
REPO_NAME=${REPO_NAME:-beepstream-mobile}

echo ""
echo "📋 Repository Details:"
echo "   Username: $GITHUB_USERNAME"
echo "   Repository: $REPO_NAME"
echo "   URL: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo ""

read -p "Continue with setup? (y/N): " confirm
if [[ $confirm != [yY] && $confirm != [yY][eE][sS] ]]; then
    echo "Setup cancelled."
    exit 0
fi

echo ""
echo "🔧 Setting up Git repository..."

# Initialize git if not already done
if [ ! -d ".git" ]; then
    git init
    echo "✅ Git repository initialized"
fi

# Add all files
git add .
echo "✅ Files staged for commit"

# Commit changes
git commit -m "Initial BeepStream mobile app with automatic APK builds

Features:
- Real-time log monitoring
- Background notifications
- Critical alert system
- Audio beeping for urgent logs
- Kill switch functionality
- GitHub Actions APK builds
- Modern Notifee notification system"

echo "✅ Changes committed"

# Set main branch
git branch -M main
echo "✅ Main branch configured"

# Add GitHub remote
git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
echo "✅ GitHub remote added"

echo ""
echo "🚀 Ready to push to GitHub!"
echo ""
echo "Next steps:"
echo "1. Make sure you've created the repository on GitHub.com"
echo "2. Run: git push -u origin main"
echo "3. GitHub Actions will automatically build your APK"
echo "4. Download APK from GitHub Actions or Releases"
echo ""
echo "📖 For detailed instructions, see: GITHUB_SETUP_GUIDE.md"
echo ""
echo "🔗 Repository URL: https://github.com/$GITHUB_USERNAME/$REPO_NAME"