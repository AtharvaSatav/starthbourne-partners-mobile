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
import {Log} from '../types/Log';

const {width} = Dimensions.get('window');

const HomeScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
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

      {/* Permissions Warning */}
      {!hasPermissions && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>⚠️ Alarm permissions needed for critical alerts</Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermissions}>
            <Text style={styles.permissionButtonText}>Grant Permissions</Text>
          </TouchableOpacity>
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
});

export default HomeScreen;