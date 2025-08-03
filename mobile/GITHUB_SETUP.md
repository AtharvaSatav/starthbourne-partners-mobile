# GitHub Actions Auto-Build Setup

## Step-by-Step GitHub Setup

### 1. Create GitHub Repository

**Option A: GitHub Web Interface**
1. Go to [github.com](https://github.com) and sign in
2. Click "New repository" (green button)
3. Name: `starthbourne-partners-mobile`
4. Description: `Real-time logging mobile app with critical alerts`
5. Set to Public (or Private if you prefer)
6. Click "Create repository"

**Option B: GitHub CLI (if installed)**
```bash
gh repo create starthbourne-partners-mobile --public
```

### 2. Upload Your Mobile Code

**Method 1: Download from Replit**
1. In this Replit, right-click on `mobile` folder
2. Select "Download as ZIP"
3. Extract the ZIP file on your computer
4. Follow Method 2 below

**Method 2: Upload to GitHub**
```bash
# Navigate to your extracted mobile folder
cd path/to/mobile

# Initialize git
git init
git add .
git commit -m "Initial mobile app commit"

# Connect to your GitHub repo (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/starthbourne-partners-mobile.git
git branch -M main
git push -u origin main
```

**Method 3: GitHub Web Upload**
1. Open your new GitHub repository
2. Click "uploading an existing file"
3. Drag and drop all files from the `mobile` folder
4. Commit with message: "Initial mobile app commit"

### 3. Automatic Build Triggers

Once code is uploaded, GitHub Actions will automatically:

**On every push to main branch:**
- ✅ Build fresh APK
- ✅ Run all tests
- ✅ Create GitHub release with download link
- ✅ Upload APK as release asset

**Manual trigger anytime:**
- Go to Actions tab → "Build Android APK" → "Run workflow"

### 4. Download Your APK

**From GitHub Releases (Recommended):**
1. Go to your repo → Releases tab
2. Download latest `starthbourne-partners-vX.apk`
3. Transfer to your Android device
4. Install and follow setup wizard

**From GitHub Actions (Build Artifacts):**
1. Go to Actions tab → Latest successful build
2. Download "starthbourne-partners-XXXXXX" artifact
3. Extract ZIP to get APK file

## Build Status & Monitoring

**Check Build Status:**
- Green checkmark ✅ = APK ready to download
- Red X ❌ = Build failed (check logs)
- Yellow circle 🟡 = Currently building

**Build Time:** Usually 5-10 minutes

**Build Logs:** Click on any build to see detailed progress

## Troubleshooting

**Build fails with "Permission denied":**
- Check that all files were uploaded correctly
- Verify `mobile/android/gradlew` has executable permissions

**"Module not found" errors:**
- Ensure `package.json` and `package-lock.json` are uploaded
- Check that dependencies are correctly listed

**Android SDK errors:**
- Builds use Android SDK 34 automatically
- All required tools are pre-installed in GitHub environment

**APK not found:**
- Wait for build to complete (check Actions tab)
- Look in Releases tab for download link
- Check build logs for specific errors

## Updating Your App

**When you make changes:**
1. Update code in GitHub (push new commits)
2. GitHub automatically builds new APK
3. New release created with updated version
4. Download latest APK and reinstall on device

**Version numbering:**
- Automatic: v1, v2, v3, etc.
- Based on GitHub build number
- Each release has unique download link

## Repository Structure

Your GitHub repo should look like this:
```
starthbourne-partners-mobile/
├── .github/
│   └── workflows/
│       └── build-android.yml     # Auto-build configuration
├── android/                      # Android native code
├── src/                         # React Native source
├── package.json                 # Dependencies
├── GITHUB_SETUP.md             # This guide
└── README.md                   # App documentation
```

## Security Notes

- APK builds in isolated GitHub environment
- No secrets or API keys stored in public repo
- Build logs are public if repo is public
- All dependencies downloaded fresh for each build

## Alternative: Private Repository

If you want to keep code private:
1. Create private GitHub repository
2. Same build process works
3. Only you can access releases and downloads
4. GitHub free plan includes private repos