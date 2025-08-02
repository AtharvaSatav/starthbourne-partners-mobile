# GitHub Repository Setup for Automatic APK Builds

Follow these steps to set up automatic APK building for your BeepStream mobile app.

## Step 1: Create GitHub Repository

1. **Go to GitHub.com** and sign in (create account if needed)
2. **Click "New Repository"** (green button)
3. **Repository Settings:**
   - Repository name: `beepstream-mobile`
   - Description: `Real-time logging app with mobile notifications`
   - Set to **Public** (required for free GitHub Actions)
   - ✅ Check "Add a README file"
4. **Click "Create repository"**

## Step 2: Upload Your Code

### Option A: Using Git Commands (Recommended)
```bash
# In your Replit terminal/shell:
git init
git add .
git commit -m "Initial BeepStream mobile app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/beepstream-mobile.git
git push -u origin main
```

### Option B: Using GitHub Web Interface
1. **Click "uploading an existing file"**
2. **Drag and drop** all your project files
3. **Commit directly** to main branch

## Step 3: Verify GitHub Actions Setup

After uploading, GitHub will automatically:
1. **Detect the workflow** in `.github/workflows/build-apk.yml`
2. **Start building** the APK (takes 10-15 minutes)
3. **Create releases** with downloadable APK files

## Step 4: Download Your APK

### From GitHub Actions (Any Push)
1. Go to your repository
2. Click **"Actions"** tab
3. Click the latest workflow run
4. Scroll down to **"Artifacts"**
5. Download **"beepstream-android-apk"**

### From GitHub Releases (Main Branch)
1. Go to your repository
2. Click **"Releases"** on the right side
3. Download **"beepstream-mobile.apk"** from latest release

## Step 5: Install APK on Phone

1. **Transfer APK** to your Android phone
2. **Enable unknown sources** in Settings → Security
3. **Install the APK** by tapping it
4. **Grant permissions** when app starts

## Automatic Updates

Every time you push code changes:
- ✅ **GitHub Actions builds** new APK automatically
- ✅ **New release created** (for main branch pushes)
- ✅ **APK downloadable** within 15 minutes
- ✅ **Version numbers** increment automatically

## Repository Structure

```
beepstream-mobile/
├── .github/workflows/build-apk.yml  # Automated build script
├── mobile/                          # React Native app code
├── client/                          # Web app frontend
├── server/                          # Backend API
├── shared/                          # Shared schemas
├── GITHUB_SETUP_GUIDE.md           # This guide
└── README.md                        # Project overview
```

## Troubleshooting

**Build failing?**
- Check GitHub Actions logs for errors
- Ensure all dependencies are in package.json
- Verify mobile/android folder structure

**APK not installing?**
- Enable "Install unknown apps" for your file manager
- Check Android version compatibility (6.0+)
- Try different file manager app

**Notifications not working?**
- Grant all permissions during first app launch
- Check notification settings in Android
- Verify backend API is accessible from phone

## Advanced: Custom Domain Setup

To use your own domain instead of the Replit URL:
1. Set up custom domain in Replit
2. Update API endpoints in mobile app
3. Rebuild APK through GitHub Actions

## Security Notes

- Repository is public (required for free GitHub Actions)
- No sensitive data should be in the code
- API keys should be environment variables
- APK files are publicly downloadable

Your BeepStream mobile app will now build automatically and be ready for installation within minutes of any code change!