import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from '../screens/SplashScreen';
import HomeScreen from '../screens/HomeScreen';
import PackageDetailScreen from '../screens/PackageDetailScreen';
import EnquiryFormScreen from '../screens/EnquiryFormScreen';
import EnquirySuccessScreen from '../screens/EnquirySuccessScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  // Show splash screen first
  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="PackageDetail" component={PackageDetailScreen} />
        <Stack.Screen name="EnquiryForm" component={EnquiryFormScreen} />
        <Stack.Screen 
          name="EnquirySuccess" 
          component={EnquirySuccessScreen}
          options={{
            gestureEnabled: false, // Prevent swipe back
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
