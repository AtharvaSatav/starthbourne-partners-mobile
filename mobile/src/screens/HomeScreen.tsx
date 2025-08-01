import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions,
  AppState,
} from 'react-native';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {SafeAreaView} from 'react-native-safe-area-context';
import {api} from '../utils/api';
import {useWebSocket} from '../hooks/useWebSocket';
import {useAudio} from '../hooks/useAudio';
import {useNotifications} from '../hooks/useNotifications';
import {useAlarmNotification} from '../hooks/useAlarmNotification';
import {usePermissionManager} from '../hooks/usePermissionManager';
import {PermissionSetupWizard} from '../components/PermissionSetupWizard';
import {useBackgroundCleanup} from '../hooks/useBackgroundCleanup';
import {Log} from '../types/Log';

const {width} = Dimensions.get('window');

const HomeScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [showPermissionWizard, setShowPermissionWizard] = useState(false);
  const queryClient = useQueryClient();
  const {isConnected, lastMessage, sendKillSwitch} = useWebSocket();
  const {isPlaying, startContinuousBeep, stopBeep} = useAudio();
  const {sendNotification} = useNotifications();
  const {
    isAlarmActive,
    hasPermissions,
    startContinuousAlarm,
    stopAlarm,
    createFullScreenNotification,
    requestPermissions,
  } = useAlarmNotification();
  
  const {
    permissionStatus,
    isRequestingPermissions,
    currentStep,
    requestAllPermissions,
    checkAllPermissions,
    openAppSettings,
    getPermissionGuide,
  } = usePermissionManager();
  
  const {
    isCleanupAvailable,
    getCleanupInfo,
    forceCleanup,
  } = useBackgroundCleanup();

  const {data: logsData, isLoading, refetch} = useQuery({
    queryKey: ['/api/logs'],
    queryFn: api.getLogs,
    refetchInterval: 5000,
  });

  const logs = logsData?.logs || [];
  const activeLogs = logs.filter(log => !log.archived);
  const beepingLogs = activeLogs.filter(log => log.beepType === 'beep');

  // Handle WebSocket messages
  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case 'NEW_LOG':
        queryClient.invalidateQueries({queryKey: ['/api/logs']});
        const newLog = lastMessage.data as Log;
        
        // Send push notification
        sendNotification(
          'New Log Entry',
          `${newLog.source}: ${newLog.message}`
        );
        
        // For beep logs, use alarm system for critical alerts
        if (newLog.beepType === 'beep') {
          if (!isPlaying && !isAlarmActive) {
            // Start both audio beeping and alarm system
            startContinuousBeep();
            startContinuousAlarm(newLog.message, newLog.source || 'System');
            createFullScreenNotification(newLog.message, newLog.source || 'System');
          }
        }
        break;

      case 'LOGS_CLEARED':
        queryClient.invalidateQueries({queryKey: ['/api/logs']});
        stopBeep();
        stopAlarm();
        break;

      case 'LOGS_ARCHIVED_AND_CLEARED':
        queryClient.invalidateQueries({queryKey: ['/api/logs']});
        stopBeep();
        stopAlarm();
        sendNotification(
          'Daily Cleanup',
          `${lastMessage.data?.count || 0} logs archived and home screen cleared`
        );
        break;
    }
  }, [lastMessage, queryClient, sendNotification, startContinuousBeep, stopBeep, isPlaying]);

  // Auto-start beeping and alarms if there are beeping logs
  useEffect(() => {
    if (beepingLogs.length > 0 && !isPlaying && !isAlarmActive) {
      startContinuousBeep();
      if (beepingLogs.length > 0) {
        const latestBeepLog = beepingLogs[0];
        startContinuousAlarm(latestBeepLog.message, latestBeepLog.source || 'System');
      }
    } else if (beepingLogs.length === 0 && (isPlaying || isAlarmActive)) {
      stopBeep();
      stopAlarm();
    }
  }, [beepingLogs.length, isPlaying, isAlarmActive, startContinuousBeep, stopBeep, startContinuousAlarm, stopAlarm, beepingLogs]);

  // Handle app state changes for background notifications
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        // App came to foreground, refresh data
        refetch();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [refetch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleClearLogs = () => {
    Alert.alert(
      'Clear All Logs',
      'Are you sure you want to clear all active logs? This action cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.clearLogs();
              queryClient.invalidateQueries({queryKey: ['/api/logs']});
              stopBeep();
            } catch (error) {
              Alert.alert('Error', 'Failed to clear logs');
            }
          },
        },
      ]
    );
  };

  const handleStopBeeping = () => {
    stopBeep();
    stopAlarm();
  };

  const handlePermissionSetupComplete = () => {
    setShowPermissionWizard(false);
    checkAllPermissions();
  };

  // Show permission wizard on first launch if permissions are missing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!permissionStatus.allGranted && !showPermissionWizard) {
        setShowPermissionWizard(true);
      }
    }, 2000); // Wait 2 seconds after app load

    return () => clearTimeout(timer);
  }, [permissionStatus.allGranted, showPermissionWizard]);

  const handleKillSwitch = () => {
    Alert.alert(
      'Kill Switch',
      'Send stop signal to all connected external scripts?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Send STOP',
          style: 'destructive',
          onPress: () => {
            sendKillSwitch();
            Alert.alert('Success', 'Stop signal sent to external scripts');
          },
        },
      ]
    );
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const LogItem = ({log}: {log: Log}) => (
    <View style={[
      styles.logItem,
      log.beepType === 'beep' ? styles.beepLog : styles.silentLog
    ]}>
      <View style={styles.logHeader}>
        <Text style={styles.logSource}>{log.source}</Text>
        <Text style={styles.logTime}>{formatTime(log.timestamp)}</Text>
      </View>
      <Text style={styles.logMessage}>{log.message}</Text>
      <View style={[
        styles.beepIndicator,
        log.beepType === 'beep' ? styles.beepIndicatorRed : styles.beepIndicatorGreen
      ]}>
        <Text style={styles.beepText}>
          {log.beepType === 'beep' ? 'BEEP' : 'SILENT'}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Stats */}
      <View style={styles.header}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{activeLogs.length}</Text>
            <Text style={styles.statLabel}>Active Logs</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{beepingLogs.length}</Text>
            <Text style={styles.statLabel}>Beeping</Text>
          </View>
          <View style={styles.statItem}>
            <View style={[
              styles.connectionIndicator,
              isConnected ? styles.connected : styles.disconnected
            ]} />
            <Text style={styles.statLabel}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Text>
          </View>
        </View>
      </View>

      {/* Permissions Setup */}
      {!permissionStatus.allGranted && (
        <View style={styles.permissionSetupContainer}>
          <View style={styles.permissionHeader}>
            <Text style={styles.permissionTitle}>🚨 Critical Alert Setup Required</Text>
            <Text style={styles.permissionSubtitle}>
              For alerts to work when your screen is off, we need to set up special permissions
            </Text>
          </View>
          
          {isRequestingPermissions && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                Step {currentStep + 1} of 5: Setting up permissions...
              </Text>
            </View>
          )}
          
          <View style={styles.permissionList}>
            {getPermissionGuide().map((permission, index) => (
              <Text key={index} style={styles.permissionItem}>{permission}</Text>
            ))}
          </View>
          
          <View style={styles.permissionButtons}>
            <TouchableOpacity 
              style={[styles.button, styles.setupButton]}
              onPress={() => setShowPermissionWizard(true)}
              disabled={isRequestingPermissions}
            >
              <Text style={styles.buttonText}>
                {isRequestingPermissions ? 'Setting up...' : 'Setup Wizard'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.manualButton]}
              onPress={openAppSettings}
            >
              <Text style={styles.buttonText}>Manual Setup</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {/* Quick Status for Granted Permissions */}
      {permissionStatus.allGranted && (
        <View style={styles.permissionSuccessContainer}>
          <Text style={styles.permissionSuccessText}>✅ Critical alerts ready - works when screen is off</Text>
        </View>
      )}

      {/* Daily Cleanup Status */}
      {permissionStatus.allGranted && (
        <View style={styles.cleanupStatusContainer}>
          <Text style={styles.cleanupStatusTitle}>🗂️ Daily Cleanup Status</Text>
          <CleanupStatusDisplay 
            getCleanupInfo={getCleanupInfo}
            isCleanupAvailable={isCleanupAvailable}
            onForceCleanup={forceCleanup}
          />
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {(isPlaying || isAlarmActive) && (
          <TouchableOpacity 
            style={[styles.button, styles.stopButton]} 
            onPress={handleStopBeeping}
          >
            <Text style={styles.buttonText}>
              {isAlarmActive ? 'Stop Urgent Alert' : 'Stop Beeping'}
            </Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.button, styles.clearButton]} 
          onPress={handleClearLogs}
        >
          <Text style={styles.buttonText}>Clear Logs</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.killButton]} 
          onPress={handleKillSwitch}
        >
          <Text style={styles.buttonText}>Kill Switch</Text>
        </TouchableOpacity>
      </View>

      {/* Logs List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading logs...</Text>
          </View>
        ) : activeLogs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No active logs</Text>
            <Text style={styles.emptySubtext}>
              Logs will appear here when received via API
            </Text>
          </View>
        ) : (
          activeLogs.map((log) => <LogItem key={log.id} log={log} />)
        )}
      </ScrollView>

      <PermissionSetupWizard
        visible={showPermissionWizard}
        onClose={() => setShowPermissionWizard(false)}
        onComplete={handlePermissionSetupComplete}
      />
    </SafeAreaView>
  );
};

const CleanupStatusDisplay = ({ getCleanupInfo, isCleanupAvailable, onForceCleanup }) => {
  const cleanupInfo = getCleanupInfo();
  
  const handleForceCleanup = async () => {
    Alert.alert(
      'Force Cleanup',
      'This will archive all logs from today and clear the home screen. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Archive Logs', 
          onPress: async () => {
            const success = await onForceCleanup();
            if (success) {
              Alert.alert('Success', 'Logs have been archived and home screen cleared.');
            } else {
              Alert.alert('Error', 'Failed to archive logs. Please try again.');
            }
          }
        },
      ]
    );
  };

  return (
    <View style={styles.cleanupDisplay}>
      <View style={styles.cleanupInfo}>
        <Text style={styles.cleanupInfoText}>
          Next cleanup: {cleanupInfo.nextCleanupTime.toLocaleString()}
        </Text>
        {cleanupInfo.lastCleanup && (
          <Text style={styles.cleanupInfoText}>
            Last cleanup: {cleanupInfo.lastCleanup.toLocaleString()}
          </Text>
        )}
        <Text style={styles.cleanupDescription}>
          At 6 PM daily, logs are automatically archived even when app is closed
        </Text>
      </View>
      
      {isCleanupAvailable && (
        <TouchableOpacity 
          style={styles.cleanupButton}
          onPress={handleForceCleanup}
        >
          <Text style={styles.cleanupButtonText}>Archive Now</Text>
        </TouchableOpacity>
      )}
    </View>
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
    borderBottomColor: '#333333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 12,
    color: '#cccccc',
    marginTop: 4,
  },
  connectionIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  connected: {
    backgroundColor: '#22c55e',
  },
  disconnected: {
    backgroundColor: '#ef4444',
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 10,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: (width - 60) / 3,
  },
  stopButton: {
    backgroundColor: '#ef4444',
  },
  clearButton: {
    backgroundColor: '#6b7280',
  },
  killButton: {
    backgroundColor: '#dc2626',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: '#cccccc',
    fontSize: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#cccccc',
    fontSize: 14,
    textAlign: 'center',
  },
  logItem: {
    backgroundColor: '#111111',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  beepLog: {
    borderLeftColor: '#ef4444',
  },
  silentLog: {
    borderLeftColor: '#22c55e',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logSource: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  logTime: {
    color: '#cccccc',
    fontSize: 12,
  },
  logMessage: {
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 8,
  },
  beepIndicator: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  beepIndicatorRed: {
    backgroundColor: '#ef4444',
  },
  beepIndicatorGreen: {
    backgroundColor: '#22c55e',
  },
  beepText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  warningContainer: {
    backgroundColor: '#dc2626',
    margin: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  warningText: {
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  permissionButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  permissionButtonText: {
    color: '#dc2626',
    fontWeight: 'bold',
    fontSize: 14,
  },
  permissionSetupContainer: {
    backgroundColor: '#1f2937',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#dc2626',
  },
  permissionHeader: {
    marginBottom: 15,
  },
  permissionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  permissionSubtitle: {
    color: '#d1d5db',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  progressContainer: {
    backgroundColor: '#374151',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  progressText: {
    color: '#f59e0b',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  permissionList: {
    marginBottom: 20,
  },
  permissionItem: {
    color: '#e5e7eb',
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  permissionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  setupButton: {
    backgroundColor: '#dc2626',
    flex: 1,
  },
  manualButton: {
    backgroundColor: '#6b7280',
    flex: 1,
  },
  permissionSuccessContainer: {
    backgroundColor: '#065f46',
    margin: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  permissionSuccessText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  cleanupStatusContainer: {
    backgroundColor: '#1f2937',
    margin: 20,
    padding: 20,
    borderRadius: 12,
  },
  cleanupStatusTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  cleanupDisplay: {
    gap: 12,
  },
  cleanupInfo: {
    gap: 6,
  },
  cleanupInfoText: {
    color: '#e5e7eb',
    fontSize: 14,
  },
  cleanupDescription: {
    color: '#9ca3af',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  cleanupButton: {
    backgroundColor: '#6b7280',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  cleanupButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default HomeScreen;