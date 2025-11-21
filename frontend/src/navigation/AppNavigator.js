import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './AuthStack';
import MainStack from './MainStack';
import SplashScreen from '../screens/onboarding/SplashScreen';
import { getToken, removeToken } from '../utils/storage';
import authService from '../services/api/auth';

const AppNavigator = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  // Check if user has valid token on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await getToken();
      
      if (token) {
        console.log('🔍 Found token, verifying with backend...');
        
        try {
          // Verify token with backend
          const response = await authService.verifyToken(token);
          
          console.log('✅ Token is valid');
          console.log('User:', response.user);
          
          setIsAuthenticated(true);
        } catch (error) {
          console.error('❌ Token verification failed:', error.message);
          console.log('Removing invalid token...');
          
          // Token is invalid or expired, remove it
          await removeToken();
          setIsAuthenticated(false);
        }
      } else {
        console.log('ℹ️ No token found');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // This function will be called after successful login
  const handleLoginSuccess = () => {
    console.log('🎉 Login success callback triggered, re-checking auth...');
    checkAuthStatus();
  };

  // This function will be called when user logs out
  const handleLogout = async () => {
    console.log('🚪 Logout triggered...');
    await removeToken();
    setIsAuthenticated(false);
  };

  // Handle splash screen finish
  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  // Show splash screen first (every time app opens)
  if (showSplash || isLoading) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <MainStack onLogout={handleLogout} />
      ) : (
        <AuthStack onLoginSuccess={handleLoginSuccess} />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;