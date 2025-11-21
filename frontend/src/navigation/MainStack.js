import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/main/HomeScreen';

const Stack = createStackNavigator();

const MainStack = ({ onLogout }) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0D34B7',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="Home"
        options={{
          title: 'Bhavan Booking',
          headerLeft: null, // Disable back button on home
        }}
      >
        {(props) => <HomeScreen {...props} onLogout={onLogout} />}
      </Stack.Screen>
      
      {/* TODO: Add more screens later
      <Stack.Screen name="Rooms" component={RoomsScreen} />
      <Stack.Screen name="Bookings" component={BookingsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      */}
    </Stack.Navigator>
  );
};

export default MainStack;