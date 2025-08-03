# Quick Start: Get Your APK in 5 Minutes

## 🚀 Step 1: Create GitHub Repository

**Go to GitHub.com and:**
1. Click "New repository" (green button)
2. Name: `starthbourne-partners-mobile` 
3. Set to Public
4. Click "Create repository"

## 📁 Step 2: Upload Mobile Code

**Download from Replit:**
1. Right-click `mobile` folder in this Replit
2. Select "Download as ZIP" 
3. Extract ZIP file on your computer

**Upload to GitHub:**
1. Open your new GitHub repository
2. Click "uploading an existing file"
3. Drag ALL files from extracted mobile folder
4. Commit message: "Initial mobile app with auto-build"
5. Click "Commit changes"

## ⚡ Step 3: Automatic Build Starts

**GitHub automatically:**
- Detects the workflow file
- Starts building your APK
- Takes about 5-8 minutes

**Check progress:**
1. Go to "Actions" tab in your repo
2. Click on "Build Android APK" 
3. Watch the build progress (green = success)

## 📱 Step 4: Download Your APK

**When build completes:**
1. Go to "Releases" tab in your repo
2. Click latest release (v1, v2, etc.)
3. Download `starthbourne-partners-vX.apk`
4. Transfer to your Android phone
5. Install and follow setup wizard

## 🔄 Step 5: Updates

**Every time you update code:**
1. Push changes to GitHub
2. New APK builds automatically  
3. New release created with download link
4. Install new version on your phone

## 📋 What You Get

**Your APK will have:**
- ✅ Critical alerts that wake phone when locked
- ✅ 24/7 background monitoring when app closed
- ✅ Automatic daily cleanup at 6 PM  
- ✅ One-tap permission setup wizard
- ✅ WebSocket connection to your Replit backend
- ✅ Background API polling for notifications

## 🧪 Test Installation

**Send test alert:**
```bash
curl -X POST your-replit-url/api/logs \
  -H "Content-Type: application/json" \
  -d '{"message":"Test critical alert","beepType":"beep","source":"test"}'
```

**Expected result:**
- Phone wakes up with full-screen alert
- Continuous beeping until acknowledged  
- Works even if phone is locked/silent

That's it! Your professional mobile monitoring app is ready.