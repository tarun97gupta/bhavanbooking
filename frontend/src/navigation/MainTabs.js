import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'react-native';
import HomeScreen from '../screens/main/HomeScreen';
import BookingsScreen from '../screens/main/BookingsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import colors from '../styles/colors';

const Tab = createBottomTabNavigator();

const MainTabs = ({ onLogout }) => {
    return (
        <>
            <StatusBar
                backgroundColor={colors.primary}
            />
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ focused, color, size }) => {
                        let iconName;

                        if (route.name === 'HomeTab') {
                            iconName = focused ? 'home' : 'home-outline';
                        } else if (route.name === 'BookingsTab') {
                            iconName = focused ? 'calendar' : 'calendar-outline';
                        } else if (route.name === 'ProfileTab') {
                            iconName = focused ? 'person' : 'person-outline';
                        }

                        return <Ionicons name={iconName} size={size} color={color} />;
                    },
                    tabBarActiveTintColor: colors.primary,
                    tabBarInactiveTintColor: colors.textSecondary,
                    tabBarStyle: {
                        backgroundColor: colors.white,
                        borderTopWidth: 0, 
                        paddingTop: 10,
                        // Shadow for iOS
                        shadowColor: '#000',
                        shadowOffset: {
                            width: 0,
                            height: -3, // Negative to cast shadow upward
                        },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        // Shadow for Android
                        elevation: 8,
                    },
                    tabBarLabelStyle: {
                        fontSize: 12,
                        fontWeight: '600',
                    },
                    headerShown: false, // We'll add custom headers later
                })}
            >
                <Tab.Screen
                    name="HomeTab"
                    component={HomeScreen}
                    options={{
                        tabBarLabel: 'Home',
                    }}
                />
                <Tab.Screen
                    name="BookingsTab"
                    component={BookingsScreen}
                    options={{
                        tabBarLabel: 'Bookings',
                    }}
                />
                <Tab.Screen
                    name="ProfileTab"
                    options={{
                        tabBarLabel: 'Profile',
                    }}
                >
                    {(props) => <ProfileScreen {...props} onLogout={onLogout} />}
                </Tab.Screen>
            </Tab.Navigator>
        </>
    );
};

export default MainTabs;