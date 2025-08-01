import PushNotification from 'react-native-push-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { backgroundNotificationService } from './backgroundNotificationService';

// Handle push notification actions and responses
export class PushNotificationHandler {
  static initialize() {
    // Configure push notification handlers
    PushNotification.configure({
      onRegister: (token) => {
        console.log('Push token registered:', token);
        // Store token for potential server-side push notifications
        AsyncStorage.setItem('pushToken', token.token);
      },

      onNotification: (notification) => {
        console.log('Push notification received:', notification);
        
        // Handle different notification types
        this.handleNotification(notification);
      },

      onAction: (notification) => {
        console.log('Push notification action:', notification);
        this.handleNotificationAction(notification);
      },

      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      popInitialNotification: true,
      requestPermissions: true,
    });

    console.log('Push notification handler initialized');
  }

  private static handleNotification(notification: any) {
    const { data, userInteraction } = notification;
    
    if (!data) return;

    switch (data.type) {
      case 'critical_log':
        this.handleCriticalLogNotification(data, userInteraction);
        break;
      case 'critical_reminder':
        this.handleCriticalReminder(data, userInteraction);
        break;
      case 'regular_log':
        this.handleRegularLogNotification(data, userInteraction);
        break;
      case 'daily_cleanup':
        this.handleDailyCleanupNotification(data, userInteraction);
        break;
      default:
        console.log('Unknown notification type:', data.type);
    }
  }

  private static handleNotificationAction(notification: any) {
    const { action, data } = notification;
    
    switch (action) {
      case 'open_app':
        // App will open automatically
        console.log('User chose to open app');
        break;
      case 'acknowledge':
        this.acknowledgeCriticalAlert(data.logId);
        break;
      case 'archive_logs':
        this.triggerLogArchive();
        break;
      default:
        console.log('Unknown notification action:', action);
    }
  }

  private static handleCriticalLogNotification(data: any, userInteraction: boolean) {
    if (userInteraction) {
      // User tapped the notification
      this.acknowledgeCriticalAlert(data.logId);
    }
  }

  private static handleCriticalReminder(data: any, userInteraction: boolean) {
    if (userInteraction) {
      // User tapped reminder notification
      this.acknowledgeCriticalAlert(data.logId);
    }
  }

  private static handleRegularLogNotification(data: any, userInteraction: boolean) {
    if (userInteraction) {
      // User tapped regular log notification
      console.log('User viewed regular log:', data.logId);
    }
  }

  private static handleDailyCleanupNotification(data: any, userInteraction: boolean) {
    if (userInteraction) {
      // User tapped cleanup notification
      console.log('User acknowledged daily cleanup');
    }
  }

  private static async acknowledgeCriticalAlert(logId: string) {
    try {
      // Cancel all reminder notifications for this log
      for (let i = 1; i <= 10; i++) {
        PushNotification.cancelLocalNotifications({
          id: `critical_reminder_${logId}_${i}`,
        });
      }

      // Cancel the main critical alert
      PushNotification.cancelLocalNotifications({
        id: `critical_${logId}`,
      });

      // Mark as acknowledged in local storage
      const acknowledgedLogs = await AsyncStorage.getItem('acknowledgedCriticalLogs');
      const ackLogs = acknowledgedLogs ? JSON.parse(acknowledgedLogs) : [];
      
      if (!ackLogs.includes(logId)) {
        ackLogs.push(logId);
        await AsyncStorage.setItem('acknowledgedCriticalLogs', JSON.stringify(ackLogs));
      }

      console.log(`Critical alert acknowledged: ${logId}`);
      
      // Send confirmation notification
      PushNotification.localNotification({
        title: 'Critical Alert Acknowledged',
        message: 'Alert has been marked as acknowledged',
        priority: 'low',
        importance: 'low',
        autoCancel: true,
      });

    } catch (error) {
      console.error('Error acknowledging critical alert:', error);
    }
  }

  private static async triggerLogArchive() {
    try {
      // Trigger manual log archive
      console.log('Manual log archive triggered from notification');
      
      // This would typically call the cleanup service
      // For now, just send confirmation
      PushNotification.localNotification({
        title: 'Log Archive Triggered',
        message: 'Manual log archive has been started',
        priority: 'low',
        importance: 'low',
        autoCancel: true,
      });

    } catch (error) {
      console.error('Error triggering log archive:', error);
    }
  }

  static async checkForAcknowledgedLogs(): Promise<string[]> {
    try {
      const acknowledgedLogs = await AsyncStorage.getItem('acknowledgedCriticalLogs');
      return acknowledgedLogs ? JSON.parse(acknowledgedLogs) : [];
    } catch (error) {
      console.error('Error checking acknowledged logs:', error);
      return [];
    }
  }

  static async clearAcknowledgedLogs() {
    try {
      await AsyncStorage.removeItem('acknowledgedCriticalLogs');
      console.log('Acknowledged logs cleared');
    } catch (error) {
      console.error('Error clearing acknowledged logs:', error);
    }
  }
}