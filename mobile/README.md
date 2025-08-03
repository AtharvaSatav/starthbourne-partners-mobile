# Starthbourne Partners Mobile App

🚨 **Real-time logging mobile app with critical alert system and 24/7 background monitoring**

## Features

### 🔔 Critical Alert System
- **Full-screen alerts** that wake phone even when locked
- **Continuous beeping** for critical logs until acknowledged
- **Repeating reminders** every 30 seconds for unacknowledged alerts
- **Works through Do Not Disturb** mode

### 📱 Background Monitoring
- **True 24/7 operation** - receives notifications when app is closed
- **Background API polling** every 15 seconds to 2 minutes when closed
- **Automatic permission setup** wizard on first launch
- **Battery optimization bypass** for reliable operation

### 🗂️ Daily Management
- **Automatic cleanup** at 6 PM daily (even when app closed)
- **Log archival system** with local storage
- **Manual archive** option available after 6 PM
- **Cleanup status display** with next/last cleanup times

### 🔗 Real-time Connectivity
- **WebSocket connection** for live updates when app is open
- **API integration** with your existing Replit backend
- **Kill switch functionality** for emergency stops
- **Automatic reconnection** handling

## Quick Start

### Download & Install
1. **Download APK** from [GitHub Releases](../../releases/latest)
2. **Enable unknown sources** on your Android device
3. **Install APK** and open app
4. **Follow setup wizard** - tap "Setup Permissions" and allow all requests
5. **Test critical alerts** by sending beep log via API

### API Integration
The app connects to your existing backend:
- **API Endpoint**: `your-replit-url/api/logs`
- **WebSocket**: `your-replit-url/ws`
- **Kill Switch**: Send WebSocket message `{type: "KILL_SWITCH", data: "STOP"}`

### Send Test Alert
```bash
curl -X POST your-replit-url/api/logs \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Critical system alert",
    "beepType": "beep",
    "source": "monitoring-system"
  }'
```

## Architecture

### Technology Stack
- **React Native 0.73** with TypeScript
- **TanStack Query** for server state management  
- **React Navigation** for screen management
- **React Native Push Notification** for background alerts
- **React Native Background Fetch** for API polling when closed
- **AsyncStorage** for local data persistence

### Permission System
Automatically requests and manages:
- ✅ **Notifications** - Basic notification access
- ✅ **Critical Alarms** - Exact alarm scheduling  
- ✅ **Display Over Apps** - Full-screen alerts over lock screen
- ✅ **Battery Optimization** - Bypass Android power management
- ✅ **Do Not Disturb** - Break through silent mode
- ✅ **Boot Completion** - Start after device restart
- ✅ **Foreground Service** - Background operation capability

### Background Services
1. **Background Fetch Service** - Polls API every 15 seconds to 2 minutes when app closed
2. **Daily Cleanup Scheduler** - Triggers log archival at 6 PM daily
3. **Push Notification Handler** - Manages alert interactions and acknowledgments

## Development

### Build from Source
```bash
# Install dependencies
npm install

# Run on Android device
npm run android

# Build release APK
cd android && ./gradlew assembleRelease
```

### Automatic Builds
- **GitHub Actions** builds APK automatically on every commit
- **Download** from Releases tab or Actions artifacts
- **Version numbering** increments automatically

## Testing

### Critical Alert Test
1. **Close app completely** (not just minimize)
2. **Wait 2-3 minutes** for background service activation
3. **Send beep log** via API
4. **Should receive** persistent critical alert within 2 minutes
5. **Repeating reminders** every 30 seconds until acknowledged

### Background Monitoring Test  
1. **Send regular log** via API while app closed
2. **Should receive** standard notification within 2 minutes
3. **App syncs** when reopened

### Daily Cleanup Test
1. **Set phone time** to 6:00 PM or later
2. **Should trigger** automatic log archival
3. **Check cleanup status** shows last cleanup time

## Troubleshooting

### No Critical Alerts
- Verify all permissions granted in phone settings
- Check battery optimization is disabled for app
- Ensure Do Not Disturb allows this app

### No Background Notifications  
- Confirm app has notification permissions
- Check background app refresh is enabled
- Verify network connectivity

### Setup Wizard Issues
- Manually grant permissions in phone Settings → Apps → Starthbourne Partners
- Restart app to re-check permission status

## Security & Privacy

- **Local data only** - logs stored locally on device
- **Your API only** - connects exclusively to your Replit backend  
- **No tracking** - no analytics or third-party services
- **Open source** - full code available for review

## Support

- **Issues**: Create GitHub issue with device info and logs
- **Features**: Submit feature requests via GitHub discussions
- **Updates**: Automatic via GitHub Actions builds

---

**Built for 24/7 critical monitoring with enterprise-grade reliability**