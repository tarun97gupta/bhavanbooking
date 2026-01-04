import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import NoInternetScreen from '../screens/NoInternetScreen';
import { checkInternetConnection, subscribeToNetworkChanges } from '../utils/networkCheck';

const NetworkCheckWrapper = ({ children }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Initial connection check
    checkConnection();

    // Subscribe to network changes
    const unsubscribe = subscribeToNetworkChanges((state) => {
      console.log('Network state changed:', state);
      setIsConnected(state.isConnected && state.isInternetReachable !== false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const checkConnection = async () => {
    setIsChecking(true);
    const connectionStatus = await checkInternetConnection();
    
    console.log('Connection check result:', connectionStatus);
    
    // Consider connected if isConnected is true and isInternetReachable is not explicitly false
    const connected = connectionStatus.isConnected && connectionStatus.isInternetReachable !== false;
    
    setIsConnected(connected);
    setIsChecking(false);
  };

  const handleRetry = async (success) => {
    if (success) {
      console.log('✅ Connection restored');
      setIsConnected(true);
    } else {
      console.log('❌ Still no connection');
      // Connection still not available, stay on NoInternetScreen
    }
  };

  // Show loading on initial check (optional)
  if (isChecking) {
    return <View style={styles.container}>{/* You can add a splash screen here */}</View>;
  }

  // Show NoInternetScreen if not connected
  if (!isConnected) {
    return <NoInternetScreen onRetry={handleRetry} />;
  }

  // Show app if connected
  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default NetworkCheckWrapper;