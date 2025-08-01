# Mobile App Deployment Guide

This guide covers how to build and distribute your Starthbourne Partners mobile app for both iOS and Android.

## Quick Start

Your React Native app is now ready! All the functionality from your web app has been converted:

- **Same API endpoints** - connects to your existing Replit backend
- **Real-time WebSocket** - live log updates
- **Push notifications** - works even when app is closed
- **Continuous beeping** - audio alerts for critical logs
- **Kill switch** - emergency stop for external scripts
- **Daily archival** - automatic cleanup integration

## Development Setup

1. **Install dependencies:**
   ```bash
   cd mobile
   npm install
   ```

2. **For iOS (macOS only):**
   ```bash
   cd ios && pod install && cd ..
   ```

3. **Run the app:**
   ```bash
   # Android
   npm run android
   
   # iOS  
   npm run ios
   ```

## Production Builds

### Android APK

1. **Generate release APK:**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

2. **Find your APK:**
   - Location: `android/app/build/outputs/apk/release/app-release.apk`
   - Size: ~15-20MB
   - Ready for distribution

### iOS App (macOS required)

1. **Build for release:**
   ```bash
   cd ios
   xcodebuild -workspace StarthbournePartners.xcworkspace \
             -scheme StarthbournePartners \
             -configuration Release \
             -destination generic/platform=iOS \
             -archivePath StarthbournePartners.xcarchive archive
   ```

2. **Create IPA file:**
   - Open Xcode
   - Window → Organizer
   - Select your archive
   - Export for distribution

## Distribution Options

### Option 1: Direct Installation (Easiest)

**Android:**
- Share the APK file directly
- Users install by enabling "Unknown sources"
- No store approval needed
- Instant distribution

**iOS:**
- Requires Apple Developer Program ($99/year)
- Use TestFlight for beta distribution
- Up to 10,000 test users
- No App Store review for internal testing

### Option 2: App Stores (Official)

**Google Play Store:**
- $25 one-time registration fee
- Upload APK to Google Play Console
- Review process: 1-3 days
- Worldwide distribution

**Apple App Store:**
- $99/year Apple Developer Program
- Submit through App Store Connect
- Review process: 1-7 days
- Premium distribution channel

## Key Advantages Over Web App

### 🔔 Background Notifications
- **Web app:** Only works when browser is open
- **Mobile app:** Push notifications even when closed
- **Benefit:** Never miss critical logs

### 🎵 Better Audio
- **Web app:** Limited by browser audio policies
- **Mobile app:** Native audio system integration
- **Benefit:** Reliable beeping alerts

### 🚨 Critical Alert System (NEW)
- **Full-screen notifications:** Like incoming phone calls
- **Screen wake capability:** Turns phone on when screen is off
- **Continuous alarms:** Beeps until manually stopped
- **Bypass Do Not Disturb:** Critical logs break through all restrictions
- **Wake lock technology:** Keeps phone responsive during alerts

### 📱 Native Experience
- **Web app:** Feels like a website
- **Mobile app:** True native app experience
- **Benefit:** Professional appearance and performance

### 🔋 Battery Optimization
- **Web app:** Browser tab management issues
- **Mobile app:** Optimized background processing
- **Benefit:** Efficient power usage

## Testing Checklist

Before distributing, test these features:

- [ ] **API Connection:** Logs load from your Replit backend
- [ ] **WebSocket:** Real-time updates work
- [ ] **Push Notifications:** Receive notifications when app is closed
- [ ] **Audio Alerts:** Beeping works for "beep" type logs
- [ ] **Critical Alerts:** Full-screen alerts wake phone when screen is off
- [ ] **Alarm System:** Continuous beeping until manually stopped
- [ ] **Screen Wake:** Phone turns on and shows alert immediately
- [ ] **Kill Switch:** Successfully sends stop signals
- [ ] **Daily Archival:** Shows cleanup notifications at 6 PM
- [ ] **Permissions:** App requests and uses alarm/wake permissions

**Critical Alert Test:**
1. Lock phone and wait 30 seconds
2. Send beep log via API
3. Phone should: turn on screen, show full-screen alert, beep continuously
4. Alert should persist until "Stop Urgent Alert" is tapped

**First-Time Setup Test:**
1. Install fresh APK on device
2. App should automatically show setup wizard
3. Follow permission setup process
4. Verify all critical permissions are granted
5. Test critical alerts work after setup

**Background Notification Test:**
1. Close the app completely (not just minimize)
2. Wait 2-3 minutes for background service to activate
3. Send API request to create new log
4. Should receive push notification within 2 minutes
5. For beep logs: Should get persistent critical alert with repeating reminders
6. Tap notification to acknowledge and stop reminders

## Distribution Recommendations

### For Internal Team Use
- **Best:** Direct APK distribution for Android
- **Cost:** Free
- **Setup time:** Immediate

### For Client Delivery
- **Best:** TestFlight (iOS) + Direct APK (Android)
- **Cost:** $99/year for iOS
- **Setup time:** 1-2 days

### For Public Release
- **Best:** Both app stores
- **Cost:** $25 (Android) + $99/year (iOS)
- **Setup time:** 1-2 weeks

## Support Information

### System Requirements
- **Android:** 6.0 (API level 23) or higher
- **iOS:** 12.0 or higher
- **Network:** Internet connection required
- **Storage:** ~50MB

### Permissions Needed
- **Internet access** - API connectivity
- **Notifications** - Push alerts
- **Audio** - Beeping functionality
- **Wake lock** - Background processing

### Troubleshooting
- **Notifications not working:** Check device settings
- **Audio issues:** Verify volume and do-not-disturb mode
- **Connection problems:** Test network and API endpoints

Your mobile app maintains 100% feature parity with the web version while adding native mobile capabilities like background notifications and better audio handling.