import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {StatusBar, StyleSheet} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import HomeScreen from './screens/HomeScreen';
import {NotificationProvider} from './hooks/useNotifications';

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
              <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{
                  title: 'Starthbourne Partners',
                  headerTitleAlign: 'center',
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </NotificationProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
};

export default App;