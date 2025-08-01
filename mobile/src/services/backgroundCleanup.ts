import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackgroundJob from 'react-native-background-job';

interface LogCleanupService {
  startBackgroundCleanup: () => void;
  stopBackgroundCleanup: () => void;
  performManualCleanup: () => Promise<void>;
  checkAndPerformDailyCleanup: () => Promise<boolean>;
}

class BackgroundCleanupService implements LogCleanupService {
  private backgroundJobStarted = false;
  private appStateSubscription: any = null;

  startBackgroundCleanup = () => {
    if (this.backgroundJobStarted) return;

    // Start background job for when app is closed
    BackgroundJob.configure({
      jobKey: 'dailyLogCleanup',
      period: 60000, // Check every minute when in background
    });

    BackgroundJob.start({
      jobKey: 'dailyLogCleanup',
      notificationTitle: 'Starthbourne Partners',
      notificationText: 'Monitoring critical logs...',
    });

    // Set up the background task
    BackgroundJob.registerHeadlessTask({
      name: 'dailyLogCleanup',
      runner: this.backgroundCleanupTask,
    });

    // Also monitor app state changes for when app comes to foreground
    this.appStateSubscription = AppState.addEventListener(
      'change',
      this.handleAppStateChange
    );

    this.backgroundJobStarted = true;
  };

  stopBackgroundCleanup = () => {
    if (!this.backgroundJobStarted) return;

    BackgroundJob.stop({
      jobKey: 'dailyLogCleanup',
    });

    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }

    this.backgroundJobStarted = false;
  };

  private backgroundCleanupTask = async () => {
    try {
      await this.checkAndPerformDailyCleanup();
    } catch (error) {
      console.error('Background cleanup task failed:', error);
    }
  };

  private handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      // App came to foreground, check if cleanup is needed
      await this.checkAndPerformDailyCleanup();
    }
  };

  checkAndPerformDailyCleanup = async (): Promise<boolean> => {
    try {
      const now = new Date();
      const currentHour = now.getHours();
      const today = now.toDateString();

      // Check if it's 6 PM or later
      if (currentHour < 18) {
        return false; // Not time for cleanup yet
      }

      // Check if we already did cleanup today
      const lastCleanupDate = await AsyncStorage.getItem('lastCleanupDate');
      if (lastCleanupDate === today) {
        return false; // Already cleaned up today
      }

      // Perform the cleanup
      await this.performManualCleanup();

      // Mark cleanup as done for today
      await AsyncStorage.setItem('lastCleanupDate', today);

      return true; // Cleanup was performed
    } catch (error) {
      console.error('Error in daily cleanup check:', error);
      return false;
    }
  };

  performManualCleanup = async (): Promise<void> => {
    try {
      // Get current logs from AsyncStorage (if we're caching them locally)
      const storedLogs = await AsyncStorage.getItem('activeLogs');
      if (!storedLogs) return;

      const logs = JSON.parse(storedLogs);
      const today = new Date().toDateString();

      // Move today's logs to archived logs
      const todayLogs = logs.filter((log: any) => {
        const logDate = new Date(log.createdAt).toDateString();
        return logDate === today;
      });

      if (todayLogs.length > 0) {
        // Get existing archived logs
        const existingArchived = await AsyncStorage.getItem('archivedLogs');
        const archivedLogs = existingArchived ? JSON.parse(existingArchived) : [];

        // Add today's logs to archive
        const updatedArchived = [...archivedLogs, ...todayLogs];
        await AsyncStorage.setItem('archivedLogs', JSON.stringify(updatedArchived));

        // Remove today's logs from active logs (keep only future logs)
        const remainingLogs = logs.filter((log: any) => {
          const logDate = new Date(log.createdAt).toDateString();
          return logDate !== today;
        });

        await AsyncStorage.setItem('activeLogs', JSON.stringify(remainingLogs));

        console.log(`Archived ${todayLogs.length} logs from today`);
      }

      // Also make API call to ensure server-side cleanup
      try {
        const response = await fetch('/api/logs/archive', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          console.warn('Server-side archive API call failed');
        }
      } catch (apiError) {
        console.warn('Could not reach server for archive API call:', apiError);
        // Continue with local cleanup even if server is unreachable
      }
    } catch (error) {
      console.error('Error performing manual cleanup:', error);
      throw error;
    }
  };
}

export const backgroundCleanupService = new BackgroundCleanupService();