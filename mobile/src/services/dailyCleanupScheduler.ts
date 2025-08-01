import PushNotification from 'react-native-push-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class DailyCleanupScheduler {
  private static CLEANUP_NOTIFICATION_ID = 'daily_cleanup_6pm';

  static scheduleDaily6PMCleanup() {
    // Cancel any existing scheduled cleanup
    PushNotification.cancelLocalNotifications({
      id: this.CLEANUP_NOTIFICATION_ID,
    });

    // Calculate next 6 PM
    const now = new Date();
    const next6PM = new Date();
    next6PM.setHours(18, 0, 0, 0); // 6:00 PM

    // If it's already past 6 PM today, schedule for tomorrow
    if (now.getHours() >= 18) {
      next6PM.setDate(next6PM.getDate() + 1);
    }

    // Schedule repeating daily notification
    PushNotification.localNotificationSchedule({
      id: this.CLEANUP_NOTIFICATION_ID,
      title: 'Daily Log Cleanup',
      message: 'Archiving today\'s logs and clearing home screen...',
      date: next6PM,
      repeatType: 'day', // Repeat daily
      actions: ['archive'],
      priority: 'high',
      importance: 'high',
      allowWhileIdle: true, // Allow even when device is idle
      invokeApp: false, // Don't open app, just run background task
    });

    console.log(`Scheduled daily cleanup for ${next6PM.toLocaleString()}`);
  }

  static async performBackgroundCleanup(): Promise<boolean> {
    try {
      const today = new Date().toDateString();
      
      // Check if already cleaned up today
      const lastCleanupDate = await AsyncStorage.getItem('lastCleanupDate');
      if (lastCleanupDate === today) {
        return false; // Already cleaned up today
      }

      // Get stored logs
      const storedLogs = await AsyncStorage.getItem('activeLogs');
      if (!storedLogs) return false;

      const logs = JSON.parse(storedLogs);
      
      // Filter today's logs
      const todayLogs = logs.filter((log: any) => {
        const logDate = new Date(log.createdAt).toDateString();
        return logDate === today;
      });

      if (todayLogs.length > 0) {
        // Archive today's logs
        const existingArchived = await AsyncStorage.getItem('archivedLogs');
        const archivedLogs = existingArchived ? JSON.parse(existingArchived) : [];
        const updatedArchived = [...archivedLogs, ...todayLogs];
        await AsyncStorage.setItem('archivedLogs', JSON.stringify(updatedArchived));

        // Remove today's logs from active logs
        const remainingLogs = logs.filter((log: any) => {
          const logDate = new Date(log.createdAt).toDateString();
          return logDate !== today;
        });
        await AsyncStorage.setItem('activeLogs', JSON.stringify(remainingLogs));

        // Mark as cleaned up
        await AsyncStorage.setItem('lastCleanupDate', today);
        await AsyncStorage.setItem('lastCleanupTimestamp', new Date().toISOString());

        // Send completion notification
        PushNotification.localNotification({
          title: 'Cleanup Complete',
          message: `Archived ${todayLogs.length} logs from today`,
          priority: 'low',
          importance: 'low',
        });

        console.log(`Background cleanup: Archived ${todayLogs.length} logs`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Background cleanup failed:', error);
      
      // Send error notification
      PushNotification.localNotification({
        title: 'Cleanup Failed',
        message: 'Unable to archive logs. Please open app to retry.',
        priority: 'low',
        importance: 'low',
      });
      
      return false;
    }
  }

  static cancelScheduledCleanup() {
    PushNotification.cancelLocalNotifications({
      id: this.CLEANUP_NOTIFICATION_ID,
    });
  }
}