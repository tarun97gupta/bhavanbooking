import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MainTabs from './MainTabs';

const Stack = createStackNavigator();

const MainStack = ({ onLogout }) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // Tabs will handle their own headers
      }}
    >
      <Stack.Screen name="MainTabs">
        {(props) => <MainTabs {...props} onLogout={onLogout} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default MainStack;