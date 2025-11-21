import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';  // ← ADD THIS
import useFirstTimeUser from '../hooks/useFirstTimeUser';

const Stack = createStackNavigator();

const AuthStack = ({ onLoginSuccess }) => {
  const { isFirstTime } = useFirstTimeUser();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // Hide header for all screens
        animationEnabled: true, // Enable animations
      }}
      initialRouteName={isFirstTime ? 'Welcome' : 'Login'}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      
      <Stack.Screen name="Login">
        {(props) => <LoginScreen {...props} onLoginSuccess={onLoginSuccess} />}
      </Stack.Screen>
      
      {/* NEW: Register Screen */}
      <Stack.Screen name="Register">
        {(props) => <RegisterScreen {...props} onRegisterSuccess={onLoginSuccess} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default AuthStack;