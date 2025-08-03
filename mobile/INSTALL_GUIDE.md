# Install Starthbourne Partners Mobile App on Android

## Quick Install Methods

### Method 1: Direct APK Installation (Recommended)

**Step 1: Build the APK**
```bash
cd mobile
npm install
cd android
./gradlew assembleRelease
```

**Step 2: Get the APK**
- Location: `mobile/android/app/build/outputs/apk/release/app-release.apk`
- Size: ~15-20MB

**Step 3: Install on Phone**

**Option A: USB Transfer**
1. Connect your Android phone to computer via USB
2. Copy `app-release.apk` to your phone's Downloads folder
3. On your phone, open Files app → Downloads
4. Tap `app-release.apk`
5. If prompted, allow "Install from unknown sources"
6. Tap "Install"

**Option B: Cloud Transfer** 
1. Upload `app-release.apk` to Google Drive, Dropbox, or email it to yourself
2. Download on your phone
3. Tap the downloaded file to install

**Option C: QR Code Transfer**
1. Use a file sharing service like WeTransfer or Send Anywhere
2. Generate QR code for the APK file
3. Scan QR code on your phone to download and install

### Method 2: Development Install (If you have Android Studio)

**Requirements:**
- Android Studio installed
- USB Debugging enabled on phone

**Steps:**
```bash
cd mobile
npm install
npm run android
```

## Phone Settings Required

**Before Installing:**
1. **Enable Unknown Sources**:
   - Settings → Security → Install unknown apps
   - Find your file manager/browser and enable it

2. **Developer Options** (if using USB install):
   - Settings → About phone → Tap "Build number" 7 times
   - Settings → Developer options → Enable "USB debugging"

## After Installation

**First Launch:**
1. App opens to setup wizard automatically
2. Grant all permissions when prompted:
   - Notifications
   - Display over other apps
   - Battery optimization bypass
   - Schedule exact alarms
   - Do Not Disturb access
3. Setup complete - app is ready for 24/7 monitoring

**Test Critical Alerts:**
1. Send API request with beepType: "beep"
2. Phone should show full-screen alert even if locked
3. Continuous beeping until acknowledged

## Troubleshooting

**"App not installed" error:**
- Enable "Install unknown apps" for your file manager
- Check if you have enough storage space
- Try restarting phone and installing again

**Permissions not working:**
- Go to phone Settings → Apps → Starthbourne Partners
- Check all permissions are granted
- Disable battery optimization for the app

**No background notifications:**
- Ensure app has all permissions granted
- Disable battery optimization
- Check Do Not Disturb settings allow this app

## Security Notes

- The APK is built from your own source code
- No data is sent to third parties
- All notifications are local or from your own API
- App only connects to your Replit backend

## Update Process

When you make changes to the mobile app:
1. Rebuild APK: `cd mobile/android && ./gradlew assembleRelease`
2. Uninstall old version from phone
3. Install new APK file
4. Permissions are remembered (no need to setup again)