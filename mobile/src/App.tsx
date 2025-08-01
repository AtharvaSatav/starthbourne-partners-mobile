import React, { useState, useEffect } from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {StatusBar, StyleSheet} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from './screens/HomeScreen';
import {FirstTimeSetupScreen} from './screens/FirstTimeSetupScreen';
import {NotificationProvider} from './hooks/useNotifications';
import {DailyCleanupScheduler} from './services/dailyCleanupScheduler';
import {backgroundNotificationService} from './services/backgroundNotificationService';
import {PushNotificationHandler} from './services/pushNotificationHandler';

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      refetchInterval: 5000,
    },
  },
});

const App = () => {
  const [showFirstTimeSetup, setShowFirstTimeSetup] = useState(false);
  const [isCheckingSetup, setIsCheckingSetup] = useState(true);

  useEffect(() => {
    checkFirstTimeSetup();
    
    // Initialize background services when app starts
    DailyCleanupScheduler.scheduleDaily6PMCleanup();
    backgroundNotificationService.initializeBackgroundService();
    backgroundNotificationService.schedulePeriodicChecks();
    PushNotificationHandler.initialize();
  }, []);

  const checkFirstTimeSetup = async () => {
    try {
      const hasCompletedSetup = await AsyncStorage.getItem('hasCompletedFirstTimeSetup');
      setShowFirstTimeSetup(hasCompletedSetup !== 'true');
    } catch (error) {
      console.error('Error checking first time setup:', error);
      setShowFirstTimeSetup(true); // Show setup on error to be safe
    } finally {
      setIsCheckingSetup(false);
    }
  };

  const handleSetupComplete = () => {
    setShowFirstTimeSetup(false);
  };

  if (isCheckingSetup) {
    return null; // Or a loading screen
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <NotificationProvider>
          <NavigationContainer>
            <StatusBar barStyle="light-content" backgroundColor="#000000" />
            <Stack.Navigator
              screenOptions={{
                headerStyle: {
                  backgroundColor: '#000000',
                },
                headerTintColor: '#ffffff',
                headerTitleStyle: {
                  fontWeight: 'bold',
                  fontSize: 18,
                },
              }}>
              {showFirstTimeSetup ? (
                <Stack.Screen
                  name="FirstTimeSetup"
                  options={{ headerShown: false }}
                >
                  {() => <FirstTimeSetupScreen onComplete={handleSetupComplete} />}
                </Stack.Screen>
              ) : (
                <Stack.Screen
                  name="Home"
                  component={HomeScreen}
                  options={{
                    title: 'Starthbourne Partners',
                    headerTitleAlign: 'center',
                  }}
                />
              )}
            </Stack.Navigator>
          </NavigationContainer>
        </NotificationProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
};

export default App;