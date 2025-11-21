import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import SplashScreen from './src/screens/onboarding/SplashScreen';
import WelcomeScreen from './src/screens/onboarding/WelcomeScreen';
import useFirstTimeUser from './src/hooks/useFirstTimeUser';
import colors from './src/styles/colors';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const { isFirstTime, isLoading, markAsComplete, resetFirstTimeStatus } = useFirstTimeUser();




  // Handle splash screen completion
  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  // Handle "Get Started" button press
  const handleGetStarted = async () => {
    await markAsComplete();
    // TODO: Navigate to Login/Register screen
    // For now, just log
    console.log('Onboarding complete! Navigate to Login screen...');
    alert('Onboarding complete! (Login screen will be added next)');
  };

  // Show loading while checking first time status
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Show splash screen
  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  // Show welcome screen for first-time users
  if (isFirstTime) {
    return <WelcomeScreen onGetStarted={handleGetStarted} />;
  }


  // Returning users - will show Login/Main app later
  return (
    <View style={styles.placeholderContainer}>
      <Text style={styles.placeholderText}>
        Welcome back!{'\n'}
        (Auth/Main screens coming next)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  placeholderText: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});