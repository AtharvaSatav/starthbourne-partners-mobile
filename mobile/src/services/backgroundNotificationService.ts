import PushNotification from 'react-native-push-notification';
import BackgroundFetch from 'react-native-background-fetch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../utils/api';

interface LogNotificationService {
  initializeBackgroundService: () => void;
  schedulePeriodicChecks: () => void;
  stopBackgroundService: () => void;
  checkForNewLogs: () => Promise<void>;
}

class BackgroundNotificationService implements LogNotificationService {
  private isInitialized = false;
  private lastCheckTimestamp: string | null = null;

  initializeBackgroundService = () => {
    if (this.isInitialized) return;

    // Configure push notifications
    PushNotification.configure({
      onRegister: (token) => {
        console.log('Push notification token:', token);
      },
      onNotification: (notification) => {
        console.log('Push notification received:', notification);
        
        // Handle critical alert notifications
        if (notification.data?.beepType === 'beep') {
          this.handleCriticalAlert(notification.data);
        }
      },
      onAction: (notification) => {
        console.log('Push notification action:', notification);
      },
      requestPermissions: Platform.OS === 'ios',
    });

    // Initialize background fetch for periodic API polling
    BackgroundFetch.configure({
      minimumFetchInterval: 15000,     // 15 seconds minimum interval
      requiredNetworkType: 'any',      // WiFi or cellular
      requiresCharging: false,         // Works on battery
      requiresDeviceIdle: false,       // Works when device is active
      stopOnTerminate: false,          // Continue after app is killed
      startOnBoot: true,               // Start after device reboot
    }, async (taskId) => {
      console.log('Background fetch executing:', taskId);
      
      try {
        await this.checkForNewLogs();
      } catch (error) {
        console.error('Background fetch failed:', error);
      }
      
      // Always finish the background task
      BackgroundFetch.finish(taskId);
    }, (error) => {
      console.error('Background fetch configuration error:', error);
    });

    // Start background fetch
    BackgroundFetch.start();
    this.isInitialized = true;
    
    console.log('Background notification service initialized');
  };

  schedulePeriodicChecks = () => {
    // Schedule local notification-based periodic checks as backup
    PushNotification.cancelAllLocalNotifications();
    
    // Schedule check every 2 minutes
    const interval = 2 * 60 * 1000; // 2 minutes
    
    PushNotification.localNotificationSchedule({
      id: 'background_log_check',
      title: 'Checking for new logs...',
      message: 'Monitoring critical system logs',
      date: new Date(Date.now() + interval),
      repeatType: 'minute',
      repeatTime: 2,
      allowWhileIdle: true,
      invokeApp: false, // Don't open app, just run check
      priority: 'low',
      importance: 'low',
      playSound: false,
      vibrate: false,
    });
  };

  checkForNewLogs = async (): Promise<void> => {
    try {
      // Get last check timestamp
      const lastCheck = await AsyncStorage.getItem('lastBackgroundCheck');
      const now = new Date().toISOString();
      
      // Fetch logs from API
      const response = await fetch(`${API_URL}/logs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API response not ok: ${response.status}`);
      }

      const data = await response.json();
      const logs = data.logs || [];
      
      // Filter new logs since last check
      const newLogs = logs.filter((log: any) => {
        if (!lastCheck) return true; // First check, consider all logs new
        return new Date(log.createdAt) > new Date(lastCheck);
      });

      // Process new logs
      for (const log of newLogs) {
        await this.processNewLog(log);
      }

      // Update last check timestamp
      await AsyncStorage.setItem('lastBackgroundCheck', now);
      
      if (newLogs.length > 0) {
        console.log(`Background check: Found ${newLogs.length} new logs`);
      }
      
    } catch (error) {
      console.error('Background log check failed:', error);
      
      // Send error notification only occasionally
      const lastErrorNotification = await AsyncStorage.getItem('lastErrorNotification');
      const now = Date.now();
      const oneHourAgo = now - (60 * 60 * 1000);
      
      if (!lastErrorNotification || parseInt(lastErrorNotification) < oneHourAgo) {
        PushNotification.localNotification({
          title: 'Log Monitoring Issue',
          message: 'Unable to check for new logs. Please check your connection.',
          priority: 'low',
          importance: 'low',
        });
        
        await AsyncStorage.setItem('lastErrorNotification', now.toString());
      }
    }
  };

  private processNewLog = async (log: any): Promise<void> => {
    // Store log locally for when app opens
    const storedLogs = await AsyncStorage.getItem('activeLogs');
    const existingLogs = storedLogs ? JSON.parse(storedLogs) : [];
    
    // Add new log if not already present
    const logExists = existingLogs.some((existing: any) => existing.id === log.id);
    if (!logExists) {
      existingLogs.unshift(log); // Add to beginning
      await AsyncStorage.setItem('activeLogs', JSON.stringify(existingLogs));
    }

    // Send appropriate notification
    if (log.beepType === 'beep') {
      await this.sendCriticalAlert(log);
    } else {
      await this.sendRegularNotification(log);
    }
  };

  private sendCriticalAlert = async (log: any): Promise<void> => {
    // Send high-priority critical alert
    PushNotification.localNotification({
      id: `critical_${log.id}`,
      title: '🚨 CRITICAL ALERT',
      message: `${log.message} - ${log.source || 'System'}`,
      priority: 'max',
      importance: 'max',
      playSound: true,
      soundName: 'default',
      vibrate: true,
      vibration: 2000,
      ongoing: true, // Makes notification persistent
      autoCancel: false, // Prevents auto-dismissal
      largeIcon: 'ic_launcher',
      smallIcon: 'ic_notification',
      color: 'red',
      lights: true,
      actions: [
        { id: 'open_app', title: 'Open App' },
        { id: 'acknowledge', title: 'Acknowledge' },
      ],
      data: {
        type: 'critical_log',
        logId: log.id,
        beepType: log.beepType,
        message: log.message,
        source: log.source,
      },
    });

    // Also schedule follow-up reminders every 30 seconds for critical alerts
    for (let i = 1; i <= 10; i++) {
      PushNotification.localNotificationSchedule({
        id: `critical_reminder_${log.id}_${i}`,
        title: '🚨 CRITICAL ALERT - UNACKNOWLEDGED',
        message: `${log.message} - Please respond immediately`,
        date: new Date(Date.now() + (i * 30 * 1000)), // Every 30 seconds
        priority: 'max',
        importance: 'max',
        playSound: true,
        vibrate: true,
        data: {
          type: 'critical_reminder',
          logId: log.id,
          reminderNumber: i,
        },
      });
    }

    console.log(`Sent critical alert for log: ${log.id}`);
  };

  private sendRegularNotification = async (log: any): Promise<void> => {
    // Send regular notification for non-critical logs
    PushNotification.localNotification({
      id: `log_${log.id}`,
      title: 'New Log Entry',
      message: `${log.message} - ${log.source || 'System'}`,
      priority: 'default',
      importance: 'default',
      playSound: false,
      vibrate: false,
      autoCancel: true,
      data: {
        type: 'regular_log',
        logId: log.id,
        message: log.message,
        source: log.source,
      },
    });
  };

  private handleCriticalAlert = (data: any): void => {
    // When user interacts with critical alert notification
    if (data.type === 'critical_log') {
      // Cancel all reminder notifications for this log
      for (let i = 1; i <= 10; i++) {
        PushNotification.cancelLocalNotifications({
          id: `critical_reminder_${data.logId}_${i}`,
        });
      }
    }
  };

  stopBackgroundService = () => {
    if (!this.isInitialized) return;

    BackgroundFetch.stop();
    PushNotification.cancelAllLocalNotifications();
    this.isInitialized = false;
    
    console.log('Background notification service stopped');
  };
}

export const backgroundNotificationService = new BackgroundNotificationService();