# Build APK Instructions

## Method 1: Local Build (Recommended)

### Requirements
- Node.js (v16 or higher)
- Java Development Kit (JDK 11 or 17)
- Android Studio (for Android SDK)

### Steps
1. **Download mobile folder** from this Replit as ZIP
2. **Extract and navigate:**
```bash
cd mobile
npm install
```

3. **Install Android requirements:**
```bash
# Check what's missing
npx react-native doctor

# If missing Android SDK, install Android Studio
# Then set ANDROID_HOME environment variable
```

4. **Build APK:**
```bash
cd android
./gradlew assembleRelease
```

5. **Find APK:**
- Location: `android/app/build/outputs/apk/release/app-release.apk`

## Method 2: GitHub Actions Build

### Setup
1. Create new GitHub repository
2. Upload your mobile code
3. Add this workflow file as `.github/workflows/build.yml`:

```yaml
name: Build Android APK
on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Setup Java
      uses: actions/setup-java@v3
      with:
        distribution: 'temurin'
        java-version: '11'
        
    - name: Setup Android SDK
      uses: android-actions/setup-android@v2
      
    - name: Install dependencies
      run: |
        cd mobile
        npm install
        
    - name: Build APK
      run: |
        cd mobile/android
        ./gradlew assembleRelease
        
    - name: Upload APK
      uses: actions/upload-artifact@v3
      with:
        name: app-release
        path: mobile/android/app/build/outputs/apk/release/app-release.apk
```

4. **Push code** to trigger build
5. **Download APK** from GitHub Actions artifacts

## Method 3: Expo EAS Build

### Setup
```bash
cd mobile
npm install -g @expo/cli
npm install -g eas-cli
```

### Build
```bash
expo login
eas build --platform android
```

### Download
- APK will be available on Expo dashboard
- Download link sent to your email

## Quick Test Options

### Option A: Use Expo Go
1. Install Expo Go on your phone
2. Convert app to Expo managed workflow
3. Scan QR code to test

### Option B: Development Server
```bash
cd mobile
npm run android  # If you have Android device connected
```

## Troubleshooting

**"ANDROID_HOME not set":**
- Install Android Studio
- Set environment variable: `export ANDROID_HOME=$HOME/Android/Sdk`

**"Java not found":**
- Install OpenJDK 11: `sudo apt install openjdk-11-jdk`
- Set JAVA_HOME: `export JAVA_HOME=/usr/lib/jvm/java-11-openjdk`

**Build fails:**
- Run `npx react-native doctor` to check requirements
- Ensure all dependencies are installed
- Check Android SDK licenses: `sdkmanager --licenses`

## Alternative: APK Signing Services

If local build is complex, you can use online services:
- **AppCenter** (Microsoft)
- **Bitrise**
- **Codemagic**

These provide free Android build environments with APK output.