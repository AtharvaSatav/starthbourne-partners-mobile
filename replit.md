# Replit.md

## Overview

This is a full-stack web application built with React frontend and Express backend, designed as a logging system with real-time WebSocket communication. The application uses a modern tech stack including TypeScript, Tailwind CSS with shadcn/ui components, PostgreSQL with Drizzle ORM, and Neon as the database provider.

**NEW: Hybrid Native Mobile App** - A hybrid native Android application is now available in the `/mobile` directory. The app intelligently switches between React Native mode (development) and pure native WebView mode (CI/production builds), providing critical alert functionality with native notifications and audio capabilities while avoiding React Native dependency compatibility issues in CI environments.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite with React plugin
- **Real-time Communication**: WebSocket client for live updates

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL via Neon serverless
- **ORM**: Drizzle ORM with migrations
- **Real-time**: WebSocket server for live communication
- **Session Management**: PostgreSQL-based session storage
- **Build Process**: ESBuild for production bundling

## Key Components

### Database Schema
- **Users Table**: Authentication with username/password
- **Logs Table**: Core logging functionality with message, beep type, source, timestamps, and archival status
- **Schema Validation**: Zod schemas for type-safe data validation

### API Structure
- REST endpoints for CRUD operations on logs
- WebSocket endpoint (`/ws`) for real-time communication
- Session-based authentication system
- Error handling middleware with structured responses

### Frontend Features
- **Audio System**: Web Audio API integration for beep notifications
- **Real-time Updates**: WebSocket client with automatic reconnection
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Toast Notifications**: User feedback system
- **Component Library**: Comprehensive UI components from shadcn/ui

### Hybrid Mobile App Features (NEW)
- **Intelligent Mode Switching**: React Native for development, native WebView for production builds
- **Native Critical Alerts**: Full-screen notifications using Android's native notification system
- **CI-Compatible Build**: Avoids React Native dependency issues during automated builds
- **Native Audio System**: Uses Android's ToneGenerator for alarm-style audio alerts
- **WebView Integration**: Loads the web app with native mobile enhancements
- **JavaScript Bridge**: Exposes native functionality to web app via JavaScript interface
- **Background Notifications**: Critical alerts even when app is minimized
- **Production-Ready APKs**: Clean builds without React Native compatibility issues
- **Fallback Architecture**: Graceful degradation when React Native components fail
- **Native Permissions**: Handles critical notification permissions natively

## Data Flow

1. **Log Creation**: External systems POST to `/api/logs` endpoint
2. **Real-time Broadcasting**: WebSocket server broadcasts new logs to connected clients
3. **Client Updates**: Frontend receives WebSocket messages and updates UI
4. **Audio Notifications**: Client plays continuous beep sounds for "beep" type logs until stopped
5. **Data Persistence**: All logs stored in PostgreSQL with archival system
6. **Daily Cleanup**: At 6 PM daily, logs are archived to database and cleared from home screen

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL driver
- **drizzle-orm**: TypeScript ORM with PostgreSQL dialect
- **@tanstack/react-query**: Server state management
- **ws**: WebSocket server implementation
- **express**: Web server framework

### UI Dependencies
- **@radix-ui/***: Accessible component primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe variant API for components
- **lucide-react**: Icon library

### Development Dependencies
- **vite**: Frontend build tool and dev server
- **tsx**: TypeScript execution for development
- **esbuild**: Production bundling for backend

## Deployment Strategy

### Development
- Frontend served by Vite dev server with HMR
- Backend runs with tsx for TypeScript execution
- Database migrations handled via `drizzle-kit push`
- Environment variables required: `DATABASE_URL`

### Production
- Frontend built to `dist/public` directory
- Backend bundled with ESBuild to `dist/index.js`
- Static files served by Express
- WebSocket server runs on same HTTP server
- Session storage uses connect-pg-simple with PostgreSQL

### Configuration
- TypeScript configured for monorepo structure
- Path aliases set up for clean imports
- Tailwind configured with component paths
- Drizzle configured for PostgreSQL with migrations directory

The application follows a clean separation of concerns with shared schemas between frontend and backend, ensuring type safety across the full stack. The real-time logging system is designed for monitoring and notification purposes with both visual and audio feedback mechanisms.

## Hybrid Mobile App Architecture

### Intelligent Dual-Mode System
- **Development Mode**: React Native 0.73 with full debugging capabilities
- **Production/CI Mode**: Pure native Android WebView with JavaScript bridge
- **Mode Detection**: Automatically switches based on CI environment variable
- **Fallback Strategy**: Graceful degradation when React Native initialization fails

### Native WebView Implementation
- **WebView Engine**: Android WebKit with JavaScript enabled
- **Bridge Interface**: Exposes native functions to web app via `window.NativeApp`
- **Critical Alerts**: Native notification system with high priority and full-screen capability
- **Audio System**: Android ToneGenerator for alarm-style sound alerts
- **Permissions**: Native handling of notification and audio permissions

### CI-Optimized Build Process
- **Dependency Exclusion**: Disables all React Native auto-linking in CI environment
- **Clean Native Build**: Uses only stable Android dependencies (WebView, OkHttp, Gson)
- **Library Removal**: Physically removes problematic React Native libraries during CI
- **Environment Detection**: CI environment triggers pure native mode automatically

### Deployment Strategy
- **Development**: React Native with Metro bundler and hot reloading
- **CI/Production**: Native Android APK builds without React Native dependencies
- **Distribution**: Clean APK files suitable for direct installation or app store distribution
- **Backend Integration**: Connects to same Replit backend via WebView HTTP requests

This hybrid approach ensures 100% compatibility with CI build systems while maintaining development flexibility and providing native mobile capabilities for critical alert functionality.