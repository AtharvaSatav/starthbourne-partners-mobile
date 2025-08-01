# Starthbourne Partners Mobile App

A React Native mobile application for real-time logging with WebSocket connectivity, push notifications, and background monitoring capabilities.

## Features

- **Real-time Log Monitoring**: Live updates via WebSocket connection
- **Push Notifications**: Background notifications for new log entries  
- **Continuous Audio Alerts**: Beeping notifications for critical logs
- **Kill Switch**: Send stop signals to external scripts
- **Daily Archival**: Automatic cleanup and organization
- **Cross-Platform**: Works on both iOS and Android

## Architecture

- **Frontend**: React Native with TypeScript
- **State Management**: TanStack Query for server state
- **Navigation**: React Navigation v6
- **Audio**: React Native Sound for beep notifications
- **Push Notifications**: React Native Push Notification
- **WebSocket**: Native WebSocket implementation
- **Backend**: Connects to existing Replit API

## API Endpoints

The app connects to your existing Replit backend:

- **API**: `https://c7a311a9-5bb5-4fe9-82f2-6ebfa5e9ffff-00-36r638d8u9zww.picard.replit.dev/api/logs`
- **WebSocket**: `wss://c7a311a9-5bb5-4fe9-82f2-6ebfa5e9ffff-00-36r638d8u9zww.picard.replit.dev/ws`

## Setup Instructions

### Prerequisites

1. Node.js (v18 or higher)
2. React Native CLI
3. Android Studio (for Android development)
4. Xcode (for iOS development - macOS only)

### Installation

1. **Install dependencies:**
   ```bash
   cd mobile
   npm install
   ```

2. **Install iOS dependencies (macOS only):**
   ```bash
   cd ios && pod install && cd ..
   ```

3. **Configure Android:**
   - Open Android Studio
   - Open the `android` folder
   - Sync project with Gradle files

## Development

### Run on Android
```bash
npm run android
```

### Run on iOS (macOS only)
```bash
npm run ios
```

### Start Metro bundler
```bash
npm start
```

## Building for Production

### Android APK
```bash
cd android
./gradlew assembleRelease
```
The APK will be generated at: `android/app/build/outputs/apk/release/app-release.apk`

### iOS App (macOS only)
```bash
cd ios
xcodebuild -workspace StarthbournePartners.xcworkspace -scheme StarthbournePartners -configuration Release -destination generic/platform=iOS -archivePath StarthbournePartners.xcarchive archive
```

## Distribution

### Android
1. **Google Play Store:**
   - Upload APK to Google Play Console
   - Complete store listing and compliance

2. **Direct Installation:**
   - Share APK file directly
   - Users need to enable "Unknown sources" in Android settings

### iOS
1. **Apple App Store:**
   - Submit through App Store Connect
   - Requires Apple Developer Program membership ($99/year)

2. **TestFlight (Beta):**
   - Distribute to up to 10,000 beta testers
   - No App Store review required for internal testing

## Key Features

### Background Notifications
- Receives push notifications even when app is closed
- Critical for monitoring systems that need 24/7 awareness
- Notifications include log source and message content

### Continuous Beeping
- Audio alerts for logs marked as "beep" type
- Continues until user manually stops
- Works when app is in foreground

### Kill Switch Integration
- Send emergency stop signals to external Python scripts
- Real-time WebSocket communication
- Confirmation dialogs to prevent accidental triggers

### Daily Archival Integration
- Automatically syncs with server's 6 PM daily cleanup
- Shows archive notifications
- Maintains clean active log display

## Permissions Required

### Android
- `INTERNET`: API and WebSocket connectivity
- `WAKE_LOCK`: Keep app responsive for notifications
- `VIBRATE`: Notification vibration
- `RECEIVE_BOOT_COMPLETED`: Restart notification service after reboot
- `FOREGROUND_SERVICE`: Background processing

### iOS
- Background App Refresh
- Notifications permission
- Network access

## Troubleshooting

### Common Issues

1. **Metro bundler not starting:**
   ```bash
   npx react-native start --reset-cache
   ```

2. **Android build errors:**
   ```bash
   cd android && ./gradlew clean && cd ..
   ```

3. **iOS build errors:**
   ```bash
   cd ios && rm -rf Pods Podfile.lock && pod install && cd ..
   ```

4. **Push notifications not working:**
   - Check device notification permissions
   - Verify app is not in power saving mode
   - Test on physical device (not simulator)

### Performance Tips

- Keep app in foreground when actively monitoring
- Disable battery optimization for the app
- Use WiFi for stable WebSocket connections
- Clear old logs regularly to maintain performance

## Development vs Production

### Development
- Uses Metro bundler for hot reloading
- Debug builds with development tools
- Can connect to localhost backends

### Production
- Optimized bundles for smaller app size
- Release builds with performance optimizations
- Production API endpoints only

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with proper TypeScript types
4. Test on both iOS and Android
5. Submit pull request

## Support

For issues or questions:
- Check existing GitHub issues
- Create new issue with device/OS information
- Include logs and reproduction steps