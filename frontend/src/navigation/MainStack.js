import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MainTabs from './MainTabs';
import PackageDetailScreen from '../screens/main/PackageDetailScreen';
import BookingDetailScreen from '../screens/main/BookingDetailScreen';
import BookingConfirmationScreen from '../screens/main/BookingConfirmationScreen';
import BookingSuccessScreen from '../screens/main/BookingSuccessScreen';
import MyBookingDetailScreen from '../screens/main/MyBookingDetailScreen';
import colors from '../styles/colors';

const Stack = createStackNavigator();

const MainStack = ({ onLogout }) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainTabs"
        options={{ headerShown: false }}
      >
        {(props) => <MainTabs {...props} onLogout={onLogout} />}
      </Stack.Screen>

      <Stack.Screen
        name="PackageDetail"
        component={PackageDetailScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="BookingDetails"
        component={BookingDetailScreen}
        options={{ headerShown: false }}
      />

      {/* Booking Confirmation Screen ✅ Add this */}
      <Stack.Screen
        name="BookingConfirmation"
        component={BookingConfirmationScreen}
        options={{ headerShown: false }}
      />
      {/* Booking Success Screen */}
      <Stack.Screen
        name="BookingSuccess"
        component={BookingSuccessScreen}
        options={{
          headerShown: false,
          gestureEnabled: false, // Prevent swipe back after payment
        }}
      />

      {/* My Booking Detail Screen (View existing bookings) */}
      <Stack.Screen
        name="MyBookingDetail"
        component={MyBookingDetailScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default MainStack;