import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePermissionManager } from '../hooks/usePermissionManager';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FirstTimeSetupScreenProps {
  onComplete: () => void;
}

export const FirstTimeSetupScreen: React.FC<FirstTimeSetupScreenProps> = ({
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const {
    permissionStatus,
    requestAllPermissions,
    isRequestingPermissions,
  } = usePermissionManager();

  const steps = [
    {
      title: 'Welcome to Starthbourne Partners',
      subtitle: 'Critical Log Monitoring System',
      description: 'This app monitors critical logs and provides 24/7 alerts, even when your phone screen is off.',
      icon: '🚨',
      action: null,
    },
    {
      title: 'Critical Alert System',
      subtitle: 'Never Miss Important Logs',
      description: 'We use advanced alarm technology that works like your phone\'s built-in alarm clock to ensure you receive critical alerts even when sleeping.',
      icon: '⏰',
      action: null,
    },
    {
      title: 'Permission Setup Required',
      subtitle: 'Enable Full Alert Capabilities',
      description: 'To provide critical alerts when your screen is off, we need special permissions. This is a one-time setup.',
      icon: '🔐',
      action: 'permissions',
    },
    {
      title: 'Setup Complete!',
      subtitle: 'You\'re All Set',
      description: 'Critical alerts are now configured. The app will wake your phone and provide continuous alerts for important logs.',
      icon: '✅',
      action: null,
    },
  ];

  useEffect(() => {
    checkFirstTimeSetup();
  }, []);

  const checkFirstTimeSetup = async () => {
    try {
      const hasCompletedSetup = await AsyncStorage.getItem('hasCompletedFirstTimeSetup');
      if (hasCompletedSetup === 'true') {
        onComplete();
      }
    } catch (error) {
      console.error('Error checking first time setup:', error);
    }
  };

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await completeSetup();
    }
  };

  const handlePermissionSetup = async () => {
    try {
      await requestAllPermissions();
      setIsSetupComplete(true);
      setCurrentStep(steps.length - 1);
    } catch (error) {
      Alert.alert(
        'Permission Setup',
        'Some permissions may not have been granted. You can continue and set them up later in the app settings.',
        [
          { text: 'Continue Anyway', onPress: () => setCurrentStep(steps.length - 1) },
          { text: 'Try Again', onPress: handlePermissionSetup },
        ]
      );
    }
  };

  const completeSetup = async () => {
    try {
      await AsyncStorage.setItem('hasCompletedFirstTimeSetup', 'true');
      onComplete();
    } catch (error) {
      console.error('Error saving setup completion:', error);
      onComplete(); // Continue anyway
    }
  };

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isPermissionStep = currentStepData.action === 'permissions';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentStep + 1) / steps.length) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            Step {currentStep + 1} of {steps.length}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.stepContainer}>
          <Text style={styles.stepIcon}>{currentStepData.icon}</Text>
          <Text style={styles.stepTitle}>{currentStepData.title}</Text>
          <Text style={styles.stepSubtitle}>{currentStepData.subtitle}</Text>
          <Text style={styles.stepDescription}>{currentStepData.description}</Text>
        </View>

        {isPermissionStep && (
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionTitle}>Required Permissions:</Text>
            <View style={styles.permissionList}>
              <Text style={styles.permissionItem}>
                📱 Notifications - Basic alerts and sounds
              </Text>
              <Text style={styles.permissionItem}>
                ⏰ Critical Alarms - Urgent alerts that work like phone alarms
              </Text>
              <Text style={styles.permissionItem}>
                🔓 Display Over Lock Screen - Show alerts when phone is locked
              </Text>
              <Text style={styles.permissionItem}>
                🔋 Battery Optimization - Prevent system from limiting alerts
              </Text>
              <Text style={styles.permissionItem}>
                🔕 Do Not Disturb - Allow critical alerts to break through
              </Text>
            </View>

            <View style={styles.permissionNote}>
              <Text style={styles.noteTitle}>What happens next:</Text>
              <Text style={styles.noteText}>
                • The system will show permission dialogs{'\n'}
                • Please tap "Allow" or "Grant" for each one{'\n'}
                • Some may open settings - just follow the guidance{'\n'}
                • The entire process takes about 1 minute
              </Text>
            </View>

            {Platform.OS === 'android' && (
              <View style={styles.androidNote}>
                <Text style={styles.androidNoteText}>
                  📱 Android users: You may see several settings screens. This is normal for security reasons.
                </Text>
              </View>
            )}
          </View>
        )}

        {isLastStep && (
          <View style={styles.completionContainer}>
            <Text style={styles.completionTitle}>What you can expect:</Text>
            <View style={styles.featureList}>
              <Text style={styles.featureItem}>
                ✅ Real-time log monitoring 24/7
              </Text>
              <Text style={styles.featureItem}>
                ✅ Critical alerts wake your phone instantly
              </Text>
              <Text style={styles.featureItem}>
                ✅ Continuous beeping until you acknowledge
              </Text>
              <Text style={styles.featureItem}>
                ✅ Works even when screen is off or in Do Not Disturb
              </Text>
              <Text style={styles.featureItem}>
                ✅ WebSocket kill switch for external scripts
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.buttons}>
          {isPermissionStep ? (
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton]}
              onPress={handlePermissionSetup}
              disabled={isRequestingPermissions}
            >
              <Text style={styles.primaryButtonText}>
                {isRequestingPermissions ? 'Setting Up Permissions...' : 'Setup Permissions'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton]}
              onPress={handleNext}
            >
              <Text style={styles.primaryButtonText}>
                {isLastStep ? 'Start Using App' : 'Continue'}
              </Text>
            </TouchableOpacity>
          )}

          {isPermissionStep && (
            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton]}
              onPress={() => setCurrentStep(steps.length - 1)}
            >
              <Text style={styles.secondaryButtonText}>Skip For Now</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#dc2626',
    borderRadius: 2,
  },
  progressText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  stepContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  stepIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  stepTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    color: '#f59e0b',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  stepDescription: {
    color: '#d1d5db',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  permissionContainer: {
    backgroundColor: '#1f2937',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  permissionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionList: {
    marginBottom: 20,
  },
  permissionItem: {
    color: '#e5e7eb',
    fontSize: 15,
    marginBottom: 12,
    lineHeight: 22,
  },
  permissionNote: {
    backgroundColor: '#374151',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  noteTitle: {
    color: '#f59e0b',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  noteText: {
    color: '#e5e7eb',
    fontSize: 14,
    lineHeight: 20,
  },
  androidNote: {
    backgroundColor: '#065f46',
    padding: 12,
    borderRadius: 8,
  },
  androidNoteText: {
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center',
  },
  completionContainer: {
    backgroundColor: '#1f2937',
    padding: 20,
    borderRadius: 12,
  },
  completionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  featureList: {
    gap: 12,
  },
  featureItem: {
    color: '#22c55e',
    fontSize: 15,
    lineHeight: 22,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  buttons: {
    gap: 12,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#dc2626',
  },
  secondaryButton: {
    backgroundColor: '#6b7280',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: '#e5e7eb',
    fontSize: 16,
  },
});