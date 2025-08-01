import { useEffect, useState } from 'react';
import { Platform, Alert, Linking, PermissionsAndroid } from 'react-native';
// @ts-ignore - react-native-alarm-notification types
import ReactNativeAN from 'react-native-alarm-notification';

export interface PermissionStatus {
  notifications: boolean;
  alarms: boolean;
  displayOverApps: boolean;
  batteryOptimization: boolean;
  doNotDisturb: boolean;
  allGranted: boolean;
}

export const usePermissionManager = () => {
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>({
    notifications: false,
    alarms: false,
    displayOverApps: false,
    batteryOptimization: false,
    doNotDisturb: false,
    allGranted: false,
  });
  
  const [isRequestingPermissions, setIsRequestingPermissions] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Check all permissions on mount
  useEffect(() => {
    checkAllPermissions();
  }, []);

  const checkAllPermissions = async () => {
    if (Platform.OS !== 'android') {
      // For iOS, we'll check what we can and assume the rest
      const status = {
        notifications: true, // We'll request this normally
        alarms: true,
        displayOverApps: true,
        batteryOptimization: true,
        doNotDisturb: true,
        allGranted: true,
      };
      setPermissionStatus(status);
      return;
    }

    try {
      // Check basic notification permission
      const notificationPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );

      // Check alarm permissions (these are usually granted automatically)
      const alarmPermission = await PermissionsAndroid.check(
        'android.permission.SCHEDULE_EXACT_ALARM'
      );

      // For system alert window and battery optimization, we can't directly check
      // but we'll assume they need to be requested
      const status = {
        notifications: notificationPermission,
        alarms: alarmPermission,
        displayOverApps: false, // Will be checked through settings intent
        batteryOptimization: false, // Will be checked through settings intent
        doNotDisturb: false, // Will be checked through settings intent
        allGranted: false,
      };

      status.allGranted = status.notifications && status.alarms;
      setPermissionStatus(status);
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };

  const requestAllPermissions = async () => {
    if (isRequestingPermissions) return;
    
    setIsRequestingPermissions(true);
    setCurrentStep(0);

    try {
      await requestPermissionsStepByStep();
    } catch (error) {
      console.error('Error requesting permissions:', error);
      Alert.alert('Error', 'Failed to request some permissions. Please try again.');
    } finally {
      setIsRequestingPermissions(false);
    }
  };

  const requestPermissionsStepByStep = async () => {
    const steps = [
      {
        title: 'Basic Notifications',
        description: 'Allow the app to send notifications',
        action: requestBasicNotifications,
      },
      {
        title: 'Critical Alerts',
        description: 'Enable urgent alerts and alarms',
        action: requestAlarmPermissions,
      },
      {
        title: 'Display Over Apps',
        description: 'Show urgent alerts over lock screen',
        action: requestDisplayOverApps,
      },
      {
        title: 'Battery Optimization',
        description: 'Prevent Android from limiting alerts',
        action: requestBatteryOptimization,
      },
      {
        title: 'Do Not Disturb',
        description: 'Allow critical alerts to break through',
        action: requestDoNotDisturbAccess,
      },
    ];

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      const step = steps[i];
      
      const shouldProceed = await new Promise<boolean>((resolve) => {
        Alert.alert(
          `Step ${i + 1} of ${steps.length}: ${step.title}`,
          step.description + '\n\nThis permission is required for critical alerts to work properly.',
          [
            {
              text: 'Skip',
              style: 'cancel',
              onPress: () => resolve(false),
            },
            {
              text: 'Grant Permission',
              onPress: () => resolve(true),
            },
          ]
        );
      });

      if (shouldProceed) {
        await step.action();
        // Give user time to complete the action
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Final check
    await checkAllPermissions();
    
    Alert.alert(
      'Setup Complete!',
      'Permission setup is finished. Critical alerts are now configured to work when your screen is off.',
      [{ text: 'OK' }]
    );
  };

  const requestBasicNotifications = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Notification Permission',
            message: 'This app needs notification access to alert you of critical logs.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    
    // For iOS, use React Native's built-in notification permission
    try {
      const permissions = await ReactNativeAN.requestPermissions({
        alert: true,
        badge: true,
        sound: true,
      });
      return permissions.alert;
    } catch (error) {
      console.error('iOS notification permission error:', error);
      return false;
    }
  };

  const requestAlarmPermissions = async () => {
    try {
      if (Platform.OS === 'android') {
        // Request exact alarm permission
        await PermissionsAndroid.request('android.permission.SCHEDULE_EXACT_ALARM');
        
        // Also request wake lock and other alarm-related permissions
        await PermissionsAndroid.requestMultiple([
          'android.permission.WAKE_LOCK',
          'android.permission.VIBRATE',
          'android.permission.USE_EXACT_ALARM',
        ]);
      }
      return true;
    } catch (error) {
      console.error('Alarm permission error:', error);
      return false;
    }
  };

  const requestDisplayOverApps = async () => {
    return new Promise<boolean>((resolve) => {
      Alert.alert(
        'Display Over Other Apps',
        'The next screen will ask for permission to display over other apps. This allows critical alerts to appear over your lock screen.\n\nPlease tap "Allow" or "Permit drawing over other apps".',
        [
          {
            text: 'Cancel',
            onPress: () => resolve(false),
          },
          {
            text: 'Open Settings',
            onPress: () => {
              if (Platform.OS === 'android') {
                Linking.openSettings().then(() => {
                  // Give user time to navigate and return
                  setTimeout(() => resolve(true), 3000);
                });
              } else {
                resolve(true);
              }
            },
          },
        ]
      );
    });
  };

  const requestBatteryOptimization = async () => {
    return new Promise<boolean>((resolve) => {
      Alert.alert(
        'Battery Optimization',
        'To ensure critical alerts work when your screen is off, please disable battery optimization for this app.\n\nLook for "Starthbourne Partners" in the list and select "Don\'t optimize" or "No restrictions".',
        [
          {
            text: 'Cancel',
            onPress: () => resolve(false),
          },
          {
            text: 'Open Battery Settings',
            onPress: () => {
              if (Platform.OS === 'android') {
                // Try to open battery optimization settings
                Linking.sendIntent('android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS')
                  .catch(() => {
                    // Fallback to general app settings
                    Linking.openSettings();
                  })
                  .finally(() => {
                    setTimeout(() => resolve(true), 3000);
                  });
              } else {
                resolve(true);
              }
            },
          },
        ]
      );
    });
  };

  const requestDoNotDisturbAccess = async () => {
    return new Promise<boolean>((resolve) => {
      Alert.alert(
        'Do Not Disturb Access',
        'To allow critical alerts to break through Do Not Disturb mode, please grant notification policy access.\n\nLook for "Starthbourne Partners" and enable access.',
        [
          {
            text: 'Cancel',
            onPress: () => resolve(false),
          },
          {
            text: 'Open DND Settings',
            onPress: () => {
              if (Platform.OS === 'android') {
                // Try to open Do Not Disturb settings
                Linking.sendIntent('android.settings.NOTIFICATION_POLICY_ACCESS_SETTINGS')
                  .catch(() => {
                    // Fallback to notification settings
                    Linking.sendIntent('android.settings.NOTIFICATION_SETTINGS')
                      .catch(() => Linking.openSettings());
                  })
                  .finally(() => {
                    setTimeout(() => resolve(true), 3000);
                  });
              } else {
                resolve(true);
              }
            },
          },
        ]
      );
    });
  };

  const openAppSettings = () => {
    Linking.openSettings();
  };

  const getPermissionGuide = () => {
    const missingPermissions = [];
    
    if (!permissionStatus.notifications) {
      missingPermissions.push('• Notifications - Allow alerts and sounds');
    }
    if (!permissionStatus.displayOverApps) {
      missingPermissions.push('• Display over apps - Show alerts on lock screen');
    }
    if (!permissionStatus.batteryOptimization) {
      missingPermissions.push('• Battery optimization - Prevent system from limiting alerts');
    }
    if (!permissionStatus.doNotDisturb) {
      missingPermissions.push('• Do Not Disturb - Allow critical alerts to break through');
    }

    return missingPermissions;
  };

  return {
    permissionStatus,
    isRequestingPermissions,
    currentStep,
    requestAllPermissions,
    checkAllPermissions,
    openAppSettings,
    getPermissionGuide,
  };
};