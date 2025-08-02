# BeepStream Mobile APK Build Instructions

## ✅ Fixed Alarm Notification Issue

The alarm notification functionality has been restored and improved:

- **Updated Library**: Replaced problematic `react-native-alarm-notification` with modern `@notifee/react-native`
- **Same Features**: All alarm capabilities preserved including:
  - Continuous beeping alerts
  - Background notifications
  - Full-screen critical alerts
  - Wake lock functionality
  - Repeating reminders every 30 seconds

## Building the APK

### Option 1: Automated GitHub Build (Recommended)

The project now includes a GitHub Actions workflow that automatically builds APKs:

1. **Push code to GitHub** - The workflow triggers automatically
2. **Download APK** - Get the built APK from:
   - GitHub Actions artifacts (for any push)
   - GitHub Releases (for main branch pushes)
3. **Install on phone** - Follow installation steps below

### Option 2: Manual Local Build

**Requirements:**
- Android Studio installed
- Android SDK configured  
- Java 17+
- Node.js 18+

**Commands:**
```bash
cd mobile
npm install
cd android
./gradlew assembleRelease
```

**Output:** `mobile/android/app/build/outputs/apk/release/app-release.apk`

## Installing APK on Android Phone

### Step 1: Transfer APK
- USB transfer to Downloads folder, OR
- Email/cloud download on phone

### Step 2: Enable Unknown Sources
- Settings → Security → Install unknown apps
- Select your file manager/browser
- Toggle "Allow from this source"

### Step 3: Install
- Open file manager
- Tap the APK file
- Tap "Install"

### Step 4: Grant Permissions
When first opening the app, grant these permissions:
- ✅ **Notifications** - For push alerts
- ✅ **Audio** - For beeping alerts
- ✅ **Background activity** - For monitoring when closed
- ✅ **Display over apps** - For critical alerts
- ✅ **Modify system settings** - For alarm functionality

## Testing Critical Features

After installation, test these key features:

1. **API Connection** - Logs should load from your Replit backend
2. **Real-time Updates** - WebSocket connection should work
3. **Background Notifications** - Close app and send test log via API
4. **Critical Alerts** - Send beep log when phone is locked
5. **Audio Alerts** - Verify beeping works for urgent logs
6. **Kill Switch** - Test emergency stop functionality

## Troubleshooting

**Notifications not working?**
- Check Android notification settings
- Ensure "Do Not Disturb" allows app notifications
- Verify all permissions granted during setup

**Audio issues?**
- Check device volume
- Test with different notification sounds
- Ensure phone not in silent mode

**Connection problems?**
- Verify internet connection
- Check Replit backend is running
- Test API endpoints manually

## Architecture Notes

The mobile app maintains 100% feature parity with the web version while adding:
- Native background processing
- Better audio handling  
- Critical alert system
- App store distribution capability

All API endpoints remain the same - the mobile app connects to your existing Replit backend without any server-side changes required.