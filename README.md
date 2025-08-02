# BeepStream - Real-Time Logging & Mobile Notification System

A full-stack web application with React Native mobile app for real-time log monitoring, featuring critical alert notifications, background processing, and emergency kill switch functionality.

## 🚀 Quick Start

### Web Application (Running Now)
- **Frontend**: React with TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express.js with PostgreSQL
- **Real-time**: WebSocket connection for live updates
- **Access**: Your Replit app is running and accessible

### Mobile Application
- **Platform**: React Native (iOS & Android)
- **Features**: Background notifications, critical alerts, native audio
- **Build**: Automated GitHub Actions APK generation

## 📱 Get the Mobile App

### Option 1: Automatic APK Builds (Recommended)
1. **Run setup script**: `./setup-github.sh`
2. **Push to GitHub**: Follow the prompts
3. **Download APK**: From GitHub Actions or Releases
4. **Install**: Enable unknown sources and install on Android

### Option 2: Manual Build
```bash
cd mobile
npm install
cd android
./gradlew assembleRelease
```

## ✨ Key Features

### Web Application
- Real-time log monitoring dashboard
- Color-coded log entries by type and source
- Audio alerts for critical "beep" logs
- WebSocket kill switch for emergency stops
- Daily archival system (6 PM cleanup)
- Responsive mobile-friendly design

### Mobile Application
- **Background Notifications**: Alerts when app is closed
- **Critical Alert System**: Full-screen notifications that wake phone
- **Continuous Audio**: Beeping until manually acknowledged
- **Wake Lock**: Keeps device responsive during alerts
- **Permission Management**: Automated setup wizard
- **Kill Switch**: Emergency stop via mobile interface

## 🔧 API Endpoints

### Logs Management
- `GET /api/logs` - Retrieve all active logs
- `POST /api/logs` - Create new log entry
- `DELETE /api/logs/:id` - Delete specific log
- `POST /api/logs/archive` - Archive logs to database

### Real-time Communication
- `WebSocket /ws` - Live log updates and kill switch signals

### Example API Usage
```bash
# Create a beep log (triggers mobile notifications)
curl -X POST http://your-replit-url/api/logs \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Critical system alert",
    "type": "beep",
    "source": "monitoring"
  }'

# Send kill switch signal
# Send via WebSocket: {"type": "kill_switch"}
```

## 🏗️ Architecture

### Backend Stack
- **Express.js**: REST API server
- **PostgreSQL**: Data persistence (Neon serverless)
- **Drizzle ORM**: Type-safe database operations
- **WebSocket**: Real-time bidirectional communication
- **Session Storage**: PostgreSQL-based user sessions

### Frontend Stack
- **React 18**: Component framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Component library
- **TanStack Query**: Server state management
- **Wouter**: Client-side routing

### Mobile Stack
- **React Native 0.73**: Native mobile development
- **Notifee**: Modern notification system
- **React Navigation**: Mobile navigation
- **Background Fetch**: Periodic updates when closed
- **Wake Lock**: Critical alert persistence

## 📋 Installation Requirements

### For Web Development
- Node.js 18+
- PostgreSQL database
- Environment variables: `DATABASE_URL`

### For Mobile Development
- Android Studio (APK building)
- Java 17+
- React Native CLI
- Physical Android device (recommended for testing)

### For Mobile Installation
- Android 6.0+ device
- Unknown sources enabled
- Required permissions: Notifications, Audio, Background activity

## 🔄 Deployment

### Web Application
- **Development**: `npm run dev` (runs both frontend and backend)
- **Production**: Built and served from single Express server
- **Database**: Automatic migrations via `npm run db:push`

### Mobile Application
- **Development**: `npm run android` (requires Android Studio)
- **Production**: APK builds via GitHub Actions
- **Distribution**: Direct APK sharing or app store publishing

## 📖 Documentation

- `GITHUB_SETUP_GUIDE.md` - Complete GitHub repository setup
- `mobile/BUILD_INSTRUCTIONS.md` - APK building and installation
- `mobile/DEPLOYMENT.md` - Mobile app deployment guide
- `mobile/PHONE_SETTINGS_GUIDE.md` - Device permission setup

## 🛡️ Security & Permissions

### Web Application
- Session-based authentication
- Environment variable configuration
- Secure WebSocket connections

### Mobile Application
- Notification permissions for alerts
- Audio permissions for beeping
- Background activity for monitoring
- System overlay for critical alerts
- Alarm scheduling for persistent notifications

## 🔍 Monitoring & Logs

### Log Types
- **info**: Standard informational messages
- **beep**: Critical alerts requiring immediate attention
- **error**: System error notifications
- **warning**: Important but non-critical alerts

### Real-time Features
- Live log updates via WebSocket
- Instant mobile notifications
- Emergency kill switch broadcasting
- Automatic daily archival scheduling

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test on both web and mobile
5. Submit pull request
6. GitHub Actions will build APK automatically

## 📞 Support

- Web app accessible via your Replit URL
- Mobile APK builds available through GitHub Actions
- Real-time monitoring and alerting system operational
- Emergency kill switch functionality active

Built with modern web and mobile technologies for reliable 24/7 monitoring and critical alert delivery.