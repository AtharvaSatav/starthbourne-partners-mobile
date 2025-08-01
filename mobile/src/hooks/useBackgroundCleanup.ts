import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';

export const useBackgroundCleanup = () => {
  const [lastCleanupTime, setLastCleanupTime] = useState<string | null>(null);
  const [isCleanupAvailable, setIsCleanupAvailable] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    checkCleanupStatus();
    
    // Set up periodic checks
    const interval = setInterval(checkCleanupStatus, 60000); // Check every minute
    
    // Check when app comes to foreground
    const appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkCleanupStatus();
      }
    });

    return () => {
      clearInterval(interval);
      appStateSubscription?.remove();
    };
  }, []);

  const checkCleanupStatus = async () => {
    try {
      const now = new Date();
      const currentHour = now.getHours();
      const today = now.toDateString();

      // Check if it's after 6 PM
      const isAfter6PM = currentHour >= 18;
      setIsCleanupAvailable(isAfter6PM);

      // Check last cleanup date
      const lastCleanupDate = await AsyncStorage.getItem('lastCleanupDate');
      const needsCleanup = isAfter6PM && lastCleanupDate !== today;

      if (needsCleanup) {
        await performDailyCleanup();
      }

      // Update last cleanup time for display
      const lastCleanupTimestamp = await AsyncStorage.getItem('lastCleanupTimestamp');
      setLastCleanupTime(lastCleanupTimestamp);
    } catch (error) {
      console.error('Error checking cleanup status:', error);
    }
  };

  const performDailyCleanup = async () => {
    try {
      const now = new Date();
      const today = now.toDateString();

      // Check if already cleaned up today
      const lastCleanupDate = await AsyncStorage.getItem('lastCleanupDate');
      if (lastCleanupDate === today) {
        return false; // Already cleaned up
      }

      // Get current logs from cache or storage
      const storedLogs = await AsyncStorage.getItem('activeLogs');
      if (storedLogs) {
        const logs = JSON.parse(storedLogs);
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

          // Invalidate React Query cache to refresh UI
          queryClient.invalidateQueries({ queryKey: ['/api/logs'] });

          console.log(`Mobile cleanup: Archived ${todayLogs.length} logs`);
        }
      }

      // Try to sync with server
      try {
        const response = await fetch('/api/logs/archive', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (response.ok) {
          // Server cleanup successful, invalidate cache
          queryClient.invalidateQueries({ queryKey: ['/api/logs'] });
        }
      } catch (apiError) {
        console.warn('Server archive API not available, using local cleanup only');
      }

      // Mark cleanup as complete
      await AsyncStorage.setItem('lastCleanupDate', today);
      await AsyncStorage.setItem('lastCleanupTimestamp', now.toISOString());
      setLastCleanupTime(now.toISOString());

      return true;
    } catch (error) {
      console.error('Error performing daily cleanup:', error);
      return false;
    }
  };

  const forceCleanup = async () => {
    try {
      // Remove the "already cleaned today" flag to force cleanup
      await AsyncStorage.removeItem('lastCleanupDate');
      const success = await performDailyCleanup();
      return success;
    } catch (error) {
      console.error('Error forcing cleanup:', error);
      return false;
    }
  };

  const getCleanupInfo = () => {
    const now = new Date();
    const nextCleanupTime = new Date();
    nextCleanupTime.setHours(18, 0, 0, 0); // 6:00 PM today
    
    if (now.getHours() >= 18) {
      // If it's already past 6 PM, next cleanup is tomorrow
      nextCleanupTime.setDate(nextCleanupTime.getDate() + 1);
    }

    return {
      nextCleanupTime,
      isCleanupTime: now.getHours() >= 18,
      lastCleanup: lastCleanupTime ? new Date(lastCleanupTime) : null,
    };
  };

  return {
    isCleanupAvailable,
    lastCleanupTime,
    checkCleanupStatus,
    performDailyCleanup,
    forceCleanup,
    getCleanupInfo,
  };
};