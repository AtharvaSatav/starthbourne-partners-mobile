import {useEffect, useState, useRef} from 'react';
import {Platform, Alert, Linking} from 'react-native';
// @ts-ignore - react-native-alarm-notification types
import ReactNativeAN from 'react-native-alarm-notification';
// @ts-ignore - react-native-wake-lock types  
import WakeLock from 'react-native-wake-lock';

export const useAlarmNotification = () => {
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [hasPermissions, setHasPermissions] = useState(false);
  const currentAlarmId = useRef<string | null>(null);

  useEffect(() => {
    checkPermissions();
    
    // Configure alarm notification settings
    const alarmNotifData = {
      title: 'URGENT LOG ALERT',
      message: 'Critical log entry requires attention!',
      channel: 'urgent-logs',
      ticker: 'BEEP LOG ALERT',
      small_icon: 'ic_launcher',
      large_icon: 'ic_launcher',
      play_sound: true,
      sound_name: 'alarm_default',
      sound_names: ['alarm_default', 'android_alarm_clock'],
      vibrate: true,
      vibration: 1000,
      importance: 'high',
      priority: 'high',
      auto_cancel: false,
      ongoing: true,
      tag: 'beep_alert',
      wake_screen: true,
      loop_sound: true,
      schedule_once: true,
      has_button: true,
      fire_date: new Date(Date.now() + 1000).toISOString(),
    };

    ReactNativeAN.requestPermissions({
      alert: true,
      badge: true,
      sound: true,
    });

    return () => {
      stopAlarm();
    };
  }, []);

  const checkPermissions = async () => {
    try {
      if (Platform.OS === 'android') {
        // Check for alarm and notification permissions
        const permissions = await ReactNativeAN.checkPermissions();
        setHasPermissions(permissions.alert && permissions.badge && permissions.sound);
      } else {
        setHasPermissions(true);
      }
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

  const startContinuousAlarm = (logMessage: string, source: string) => {
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

      // Schedule immediate alarm
      const alarmData = {
        id: alarmId,
        title: '🚨 URGENT LOG ALERT',
        message: `${source}: ${logMessage}`,
        channel: 'urgent-logs',
        ticker: 'CRITICAL BEEP LOG',
        small_icon: 'ic_launcher',
        large_icon: 'ic_launcher',
        play_sound: true,
        sound_name: 'alarm_clock',
        vibrate: true,
        vibration: 2000,
        importance: 'max',
        priority: 'max',
        auto_cancel: false,
        ongoing: true,
        wake_screen: true,
        turn_screen_on: true,
        show_when_locked: true,
        loop_sound: true,
        fire_date: new Date(Date.now() + 500).toISOString(),
        repeat_interval: 'minute', // Repeat every minute until stopped
        has_button: true,
        button_text: 'STOP ALERT',
        data: {
          type: 'beep_alert',
          source: source,
          message: logMessage,
        },
      };

      ReactNativeAN.scheduleAlarm(alarmData);
      setIsAlarmActive(true);

      // Also schedule repeating alarms every 30 seconds for persistence
      for (let i = 1; i <= 10; i++) {
        const repeatAlarmId = `${alarmId}_repeat_${i}`;
        const repeatData = {
          ...alarmData,
          id: repeatAlarmId,
          fire_date: new Date(Date.now() + (i * 30000)).toISOString(),
          repeat_interval: undefined,
        };
        ReactNativeAN.scheduleAlarm(repeatData);
      }

      console.log('Continuous alarm started:', alarmId);
    } catch (error) {
      console.error('Error starting alarm:', error);
      Alert.alert('Error', 'Failed to start urgent alert. Check app permissions.');
    }
  };

  const stopAlarm = () => {
    try {
      if (currentAlarmId.current) {
        // Cancel main alarm and all repeats
        ReactNativeAN.deleteAlarm(currentAlarmId.current);
        
        // Cancel repeat alarms
        for (let i = 1; i <= 10; i++) {
          ReactNativeAN.deleteAlarm(`${currentAlarmId.current}_repeat_${i}`);
        }
        
        currentAlarmId.current = null;
      }
      
      // Cancel all pending alarms with beep_alert tag
      ReactNativeAN.stopAlarmSound();
      ReactNativeAN.removeFiredNotification();
      ReactNativeAN.removeAllFiredNotifications();
      
      // Release wake lock
      WakeLock.deactivate();
      
      setIsAlarmActive(false);
      console.log('All alarms stopped');
    } catch (error) {
      console.error('Error stopping alarm:', error);
    }
  };

  const createFullScreenNotification = (logMessage: string, source: string) => {
    if (Platform.OS === 'android') {
      // Create a high-priority notification that appears as overlay
      const notificationData = {
        id: `fullscreen_${Date.now()}`,
        title: '🚨 CRITICAL LOG ALERT',
        message: `${source}: ${logMessage}`,
        channel: 'urgent-logs',
        importance: 'max',
        priority: 'max',
        category: 'alarm',
        full_screen_intent: true,
        show_when_locked: true,
        turn_screen_on: true,
        wake_screen: true,
        ongoing: true,
        auto_cancel: false,
        vibrate: true,
        vibration: 3000,
        sound_name: 'alarm_clock',
        play_sound: true,
        loop_sound: true,
        fire_date: new Date(Date.now() + 100).toISOString(),
      };

      ReactNativeAN.sendNotification(notificationData);
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