import React, {createContext, useContext, useEffect} from 'react';
// @ts-ignore - react-native-push-notification types
import PushNotification from 'react-native-push-notification';
import {Platform} from 'react-native';

// Type definitions for push notifications
interface NotificationChannel {
  channelId: string;
  channelName: string;
  channelDescription: string;
  importance: 'high' | 'low' | 'default' | 'max' | 'min';
  vibrate: boolean;
  playSound: boolean;
  soundName: string;
}

interface LocalNotification {
  channelId: string;
  title: string;
  message: string;
  playSound: boolean;
  soundName: string;
  importance: string;
  priority: string;
  vibrate: boolean;
  vibration: number;
}

interface NotificationContextType {
  sendNotification: (title: string, message: string) => void;
  setupNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  useEffect(() => {
    setupNotifications();
  }, []);

  const setupNotifications = () => {
    PushNotification.configure({
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },
      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
      },
      onAction: function (notification) {
        console.log('ACTION:', notification.action);
        console.log('NOTIFICATION:', notification);
      },
      onRegistrationError: function(err) {
        console.error(err.message, err);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });

    PushNotification.createChannel(
      {
        channelId: 'starthbourne-logs',
        channelName: 'Starthbourne Logs',
        channelDescription: 'Notifications for new log entries',
        importance: 'high' as any,
        vibrate: true,
        playSound: true,
        soundName: 'default',
      } as NotificationChannel,
      (created: boolean) => console.log(`createChannel returned '${created}'`)
    );
  };

  const sendNotification = (title: string, message: string) => {
    PushNotification.localNotification({
      channelId: 'starthbourne-logs',
      title,
      message,
      playSound: true,
      soundName: 'default',
      importance: 'high',
      priority: 'high',
      vibrate: true,
      vibration: 300,
    } as LocalNotification);
  };

  return (
    <NotificationContext.Provider value={{sendNotification, setupNotifications}}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};