import {useEffect, useState, useRef} from 'react';
import {Platform, Alert, Linking} from 'react-native';
import notifee, {AndroidImportance, AndroidCategory, TriggerType, RepeatFrequency} from '@notifee/react-native';
// @ts-ignore - react-native-wake-lock types  
import WakeLock from 'react-native-wake-lock';

export const useAlarmNotification = () => {
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [hasPermissions, setHasPermissions] = useState(false);
  const currentAlarmId = useRef<string | null>(null);

  useEffect(() => {
    initializeNotifee();
    checkPermissions();

    return () => {
      stopAlarm();
    };
  }, []);

  const initializeNotifee = async () => {
    try {
      // Create notification channel for urgent alerts
      await notifee.createChannel({
        id: 'urgent-logs',
        name: 'Urgent Log Alerts',
        importance: AndroidImportance.HIGH,
        vibration: true,
        vibrationPattern: [300, 500],
        sound: 'default',
      });

      // Request permissions
      await notifee.requestPermission();
    } catch (error) {
      console.error('Error initializing Notifee:', error);
    }
  };

  const checkPermissions = async () => {
    try {
      const settings = await notifee.getNotificationSettings();
      setHasPermissions(settings.authorizationStatus === 1); // 1 = authorized
    } catch (error) {
      console.error('Error checking permissions:', error);
      setHasPermissions(false);
    }
  };

  const requestPermissions = () => {
    Alert.alert(
      'Permissions Required',
      'This app needs special permissions to provide urgent alerts:\n\n' +
      '• Display over other apps\n' +
      '• Modify system settings\n' +
      '• Schedule exact alarms\n' +
      '• Override Do Not Disturb\n\n' +
      'These are needed for critical log alerts when screen is off.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Open Settings',
          onPress: () => {
            if (Platform.OS === 'android') {
              // Open Android settings for the app
              Linking.openSettings();
            }
          },
        },
      ]
    );
  };

  const startContinuousAlarm = async (logMessage: string, source: string) => {
    if (!hasPermissions) {
      requestPermissions();
      return;
    }

    try {
      // Activate wake lock to keep device responsive
      WakeLock.activate();
      
      // Create unique alarm ID
      const alarmId = `beep_alarm_${Date.now()}`;
      currentAlarmId.current = alarmId;

      // Create immediate notification
      await notifee.displayNotification({
        id: alarmId,
        title: '🚨 URGENT LOG ALERT',
        body: `${source}: ${logMessage}`,
        data: {
          type: 'beep_alert',
          source: source,
          message: logMessage,
        },
        android: {
          channelId: 'urgent-logs',
          importance: AndroidImportance.HIGH,
          category: AndroidCategory.ALARM,
          ongoing: true,
          autoCancel: false,
          showWhen: true,
          showTimestamp: true,
          vibrationPattern: [300, 500, 300, 500],
          actions: [
            {
              title: 'STOP ALERT',
              pressAction: {
                id: 'stop_alarm',
              },
            },
          ],
        },
      });

      // Schedule repeating notifications every 30 seconds for persistence
      for (let i = 1; i <= 10; i++) {
        const trigger = {
          type: TriggerType.TIMESTAMP,
          timestamp: Date.now() + (i * 30000),
        };

        await notifee.createTriggerNotification(
          {
            id: `${alarmId}_repeat_${i}`,
            title: '🚨 URGENT LOG ALERT (Reminder)',
            body: `${source}: ${logMessage}`,
            data: {
              type: 'beep_alert_repeat',
              source: source,
              message: logMessage,
            },
            android: {
              channelId: 'urgent-logs',
              importance: AndroidImportance.HIGH,
              category: AndroidCategory.ALARM,
              vibrationPattern: [300, 500],
            },
          },
          trigger
        );
      }

      setIsAlarmActive(true);
      console.log('Continuous alarm started:', alarmId);
    } catch (error) {
      console.error('Error starting alarm:', error);
      Alert.alert('Error', 'Failed to start urgent alert. Check app permissions.');
    }
  };

  const stopAlarm = async () => {
    try {
      if (currentAlarmId.current) {
        // Cancel main notification
        await notifee.cancelNotification(currentAlarmId.current);
        
        // Cancel repeat notifications
        for (let i = 1; i <= 10; i++) {
          await notifee.cancelNotification(`${currentAlarmId.current}_repeat_${i}`);
        }
        
        currentAlarmId.current = null;
      }
      
      // Cancel all notifications with trigger notifications
      await notifee.cancelAllNotifications();
      
      // Release wake lock
      WakeLock.deactivate();
      
      setIsAlarmActive(false);
      console.log('All alarms stopped');
    } catch (error) {
      console.error('Error stopping alarm:', error);
    }
  };

  const createFullScreenNotification = async (logMessage: string, source: string) => {
    if (Platform.OS === 'android') {
      try {
        // Create a high-priority notification that appears as overlay
        await notifee.displayNotification({
          id: `fullscreen_${Date.now()}`,
          title: '🚨 CRITICAL LOG ALERT',
          body: `${source}: ${logMessage}`,
          data: {
            type: 'fullscreen_alert',
            source: source,
            message: logMessage,
          },
          android: {
            channelId: 'urgent-logs',
            importance: AndroidImportance.HIGH,
            category: AndroidCategory.ALARM,
            fullScreenAction: {
              id: 'fullscreen',
            },
            ongoing: true,
            autoCancel: false,
            vibrationPattern: [1000, 1000, 1000],
            actions: [
              {
                title: 'ACKNOWLEDGE',
                pressAction: {
                  id: 'acknowledge',
                },
              },
            ],
          },
        });
      } catch (error) {
        console.error('Error creating full-screen notification:', error);
      }
    }
  };

  return {
    isAlarmActive,
    hasPermissions,
    startContinuousAlarm,
    stopAlarm,
    createFullScreenNotification,
    requestPermissions,
  };
};