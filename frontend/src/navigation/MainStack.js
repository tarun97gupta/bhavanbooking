import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MainTabs from './MainTabs';
import PackageDetailScreen from '../screens/main/PackageDetailScreen';

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
      {/* Package Detail Screen ✅ Add this */}
      <Stack.Screen
        name="PackageDetail"
        component={PackageDetailScreen}
        options={{
          headerShown: false, // Custom header in component
        }}
      />
    </Stack.Navigator>
  );
};

export default MainStack;