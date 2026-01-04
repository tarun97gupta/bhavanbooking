import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import NetworkCheckWrapper from './src/components/NetworkCheckWrapper';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      {/* ✅ NetworkCheckWrapper wraps AppNavigator (which has NavigationContainer inside) */}
      <NetworkCheckWrapper>
        <AppNavigator />
      </NetworkCheckWrapper>
    </SafeAreaProvider>
  );
}