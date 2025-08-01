import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { usePermissionManager } from '../hooks/usePermissionManager';

interface PermissionSetupWizardProps {
  visible: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const PermissionSetupWizard: React.FC<PermissionSetupWizardProps> = ({
  visible,
  onClose,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { requestAllPermissions, permissionStatus } = usePermissionManager();

  const steps = [
    {
      title: 'Welcome to Critical Alert Setup',
      description: 'To ensure you never miss important logs, we need to set up special permissions that allow alerts to work even when your phone screen is off.',
      icon: '🚨',
    },
    {
      title: 'Basic Notifications',
      description: 'First, we\'ll enable basic notifications so the app can alert you.',
      icon: '📱',
    },
    {
      title: 'Critical Alarms',
      description: 'Next, we\'ll set up alarm permissions for urgent alerts that work like your phone\'s built-in alarm clock.',
      icon: '⏰',
    },
    {
      title: 'Display Over Lock Screen',
      description: 'This allows critical alerts to appear even when your phone is locked.',
      icon: '🔓',
    },
    {
      title: 'Battery Optimization',
      description: 'We\'ll ensure Android doesn\'t limit the app\'s ability to wake your phone for critical alerts.',
      icon: '🔋',
    },
    {
      title: 'Do Not Disturb Access',
      description: 'Finally, we\'ll allow critical alerts to break through Do Not Disturb mode.',
      icon: '🔕',
    },
    {
      title: 'Setup Complete!',
      description: 'Your phone is now configured to receive critical alerts 24/7, even when the screen is off.',
      icon: '✅',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStartSetup = async () => {
    try {
      await requestAllPermissions();
      setCurrentStep(steps.length - 1); // Go to completion step
    } catch (error) {
      Alert.alert('Setup Error', 'Some permissions may not have been granted. You can try again or set them up manually in settings.');
    }
  };

  const currentStepData = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const isSetupStep = currentStep >= 1 && currentStep <= 5;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Critical Alert Setup</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.stepContainer}>
            <Text style={styles.stepIcon}>{currentStepData.icon}</Text>
            <Text style={styles.stepTitle}>{currentStepData.title}</Text>
            <Text style={styles.stepDescription}>{currentStepData.description}</Text>
          </View>

          {isSetupStep && (
            <View style={styles.setupInstructions}>
              <Text style={styles.instructionTitle}>What happens next:</Text>
              <Text style={styles.instructionText}>
                • You'll see system permission dialogs
              </Text>
              <Text style={styles.instructionText}>
                • Tap "Allow" or "Grant" for each permission
              </Text>
              <Text style={styles.instructionText}>
                • Some may open settings - just follow the guidance
              </Text>
              <Text style={styles.instructionText}>
                • The setup is automatic and takes about 1 minute
              </Text>
            </View>
          )}

          {isLastStep && (
            <View style={styles.completionStatus}>
              <Text style={styles.statusTitle}>Permission Status:</Text>
              <View style={styles.statusList}>
                <Text style={styles.statusItem}>
                  {permissionStatus.notifications ? '✅' : '❌'} Notifications
                </Text>
                <Text style={styles.statusItem}>
                  {permissionStatus.alarms ? '✅' : '❌'} Critical Alarms
                </Text>
                <Text style={styles.statusItem}>
                  {permissionStatus.displayOverApps ? '✅' : '⚠️'} Display Over Apps
                </Text>
                <Text style={styles.statusItem}>
                  {permissionStatus.batteryOptimization ? '✅' : '⚠️'} Battery Optimization
                </Text>
                <Text style={styles.statusItem}>
                  {permissionStatus.doNotDisturb ? '✅' : '⚠️'} Do Not Disturb Access
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.navigation}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentStep + 1) / steps.length) * 100}%` }
              ]} 
            />
          </View>

          <View style={styles.buttons}>
            {!isFirstStep && (
              <TouchableOpacity 
                style={[styles.button, styles.secondaryButton]} 
                onPress={handlePrevious}
              >
                <Text style={styles.secondaryButtonText}>Back</Text>
              </TouchableOpacity>
            )}

            {isFirstStep && (
              <TouchableOpacity 
                style={[styles.button, styles.primaryButton]} 
                onPress={handleNext}
              >
                <Text style={styles.primaryButtonText}>Start Setup</Text>
              </TouchableOpacity>
            )}

            {isSetupStep && currentStep === 1 && (
              <TouchableOpacity 
                style={[styles.button, styles.primaryButton]} 
                onPress={handleStartSetup}
              >
                <Text style={styles.primaryButtonText}>Begin Auto-Setup</Text>
              </TouchableOpacity>
            )}

            {isSetupStep && currentStep > 1 && (
              <TouchableOpacity 
                style={[styles.button, styles.primaryButton]} 
                onPress={handleNext}
              >
                <Text style={styles.primaryButtonText}>Continue</Text>
              </TouchableOpacity>
            )}

            {isLastStep && (
              <TouchableOpacity 
                style={[styles.button, styles.primaryButton]} 
                onPress={onComplete}
              >
                <Text style={styles.primaryButtonText}>Finish</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: '#9ca3af',
    fontSize: 18,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  stepContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  stepIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  stepTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  stepDescription: {
    color: '#d1d5db',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  setupInstructions: {
    backgroundColor: '#1f2937',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  instructionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  instructionText: {
    color: '#e5e7eb',
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  completionStatus: {
    backgroundColor: '#1f2937',
    padding: 20,
    borderRadius: 12,
  },
  statusTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statusList: {
    gap: 8,
  },
  statusItem: {
    color: '#e5e7eb',
    fontSize: 14,
    lineHeight: 20,
  },
  navigation: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    marginBottom: 20,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#dc2626',
    borderRadius: 2,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#dc2626',
  },
  secondaryButton: {
    backgroundColor: '#374151',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: '#d1d5db',
    fontSize: 16,
  },
});