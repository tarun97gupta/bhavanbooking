import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, Dimensions } from 'react-native';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import * as storage from '../../utils/storage';
import BookingWidget from '../../components/BookingWidget';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await storage.getUser();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Extract first name from full name
  const getFirstName = (fullName) => {
    if (!fullName) return 'Guest';
    return fullName.split(' ')[0];
  };

  // Handle check availability (will navigate to RoomsList screen)
  const handleCheckAvailability = (bookingData) => {
    console.log('Booking data:', bookingData);
    
    // TODO: Navigate to RoomsList screen once created
    // navigation.navigate('RoomsList', bookingData);
    
    // For now, show an alert
    Alert.alert(
      'Checking Availability',
      `Category: ${bookingData.category.name}\nCheck-in: ${bookingData.checkInDate}\nCheck-out: ${bookingData.checkOutDate}\nNights: ${bookingData.numberOfNights}`,
      [{ text: 'OK' }]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Single Scrollable Container */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Background Split - 30% Blue, 70% White - Inside ScrollView to scroll with content */}
        <View style={styles.backgroundBlue} />
        <View style={styles.backgroundWhite} />
        {/* Greeting Section */}
        <View style={styles.greetingSection}>
          <Text style={styles.greeting}>Hello, {getFirstName(user?.fullName)}</Text>
          <Text style={styles.welcomeText}>Welcome to My App</Text>
        </View>

        {/* Booking Widget */}
        <View style={styles.widgetWrapper}>
          <BookingWidget onCheckAvailability={handleCheckAvailability} />
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          <Text style={styles.contentTitle}>Quick Actions</Text>
          <Text style={styles.contentSubtitle}>
            Your home screen content will appear here
          </Text>
          
          {/* Placeholder for future content */}
          <View style={styles.placeholderCard}>
            <Text style={styles.placeholderText}>🏨</Text>
            <Text style={styles.placeholderTitle}>Book a Room</Text>
            <Text style={styles.placeholderSubtitle}>
              Find and book your perfect room
            </Text>
          </View>

          <View style={styles.placeholderCard}>
            <Text style={styles.placeholderText}>📅</Text>
            <Text style={styles.placeholderTitle}>View Bookings</Text>
            <Text style={styles.placeholderSubtitle}>
              Check your upcoming reservations
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },

  // Background Split - Scrollable backgrounds
  backgroundBlue: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.3, // 30% of screen height
    backgroundColor: colors.primary,
  },
  backgroundWhite: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.3, // Start after blue section
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 2, // Tall enough to cover scrolled content
    backgroundColor: colors.white,
  },

  // Scrollable Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.xl + 20, // Status bar padding
    paddingBottom: spacing.xxl,
  },

  // Greeting Section
  greetingSection: {
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingBottom: spacing.lg,
    zIndex: 1, // Above backgrounds
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  welcomeText: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.9,
  },

  // Widget Wrapper
  widgetWrapper: {
    marginBottom: spacing.lg,
    zIndex: 2, // Above backgrounds
  },

  // Content Section
  contentSection: {
    paddingHorizontal: spacing.screenPaddingHorizontal,
    zIndex: 1, // Above backgrounds
  },
  contentTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  contentSubtitle: {
    fontSize: spacing.fontMd,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },

  // PLACEHOLDER CARDS (will be replaced with real features)
  placeholderCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    padding: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
    
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    
    // Shadow for Android
    elevation: 3,
    
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  placeholderText: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  placeholderSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default HomeScreen;