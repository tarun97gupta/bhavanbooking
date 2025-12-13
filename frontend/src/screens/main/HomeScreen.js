import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  Alert, 
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  Platform
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import * as storage from '../../utils/storage';
import BookingWidget from '../../components/BookingWidget';
import packageService from '../../services/api/packages';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [selectedDates, setSelectedDates] = useState(null);
  const insets = useSafeAreaInsets(); // For safe area padding

  useEffect(() => {
    loadUserData();
    loadPackages(); // Load packages on mount
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

  const loadPackages = async () => {
    try {
      setLoadingPackages(true);
      const result = await packageService.fetchPackages();
      setPackages(result.packages);
      console.log('📦 Loaded packages:', result.count);
    } catch (error) {
      console.error('Error loading packages:', error);
    } finally {
      setLoadingPackages(false);
    }
  };

  // Quick Scenarios Data
  const quickScenarios = [
    {
      id: '1',
      title: 'Plan Function',
      subtitle: 'Hall + Rooms + Dining',
      icon: 'restaurant-outline',
      color: '#E74C3C',
      category: 'function_hall_dining'
    },
    {
      id: '2',
      title: 'Stay Only',
      subtitle: 'Rooms and essential.',
      icon: 'bed-outline',
      color: '#3498DB',
      category: 'rooms_only'
    },
    {
      id: '3',
      title: 'Host a Meeting',
      subtitle: 'Mini hall + parking',
      icon: 'people-outline',
      color: '#9B59B6',
      category: 'mini_hall'
    },
    {
      id: '4',
      title: 'Book Entire Bhavan',
      subtitle: 'Full property access',
      icon: 'business-outline',
      color: '#0D34B7',
      category: 'full_venue'
    },
  ];

  // Handle Check Availability from BookingWidget
  const handleCheckAvailability = (bookingData) => {
    console.log('📋 Booking data received:', bookingData);

    // Store selected dates for Services section filtering (optional)
    setSelectedDates({
      checkInDate: bookingData.checkInDate,
      checkOutDate: bookingData.checkOutDate,
      numberOfNights: bookingData.numberOfNights
    });

    // Navigate to PackageDetail screen
    if (bookingData.category?.id) {
      console.log('→ Navigating to PackageDetail:', bookingData.category.name);
      
      navigation.navigate('PackageDetail', {
        packageId: bookingData.category.id,
        checkInDate: bookingData.checkInDate,
        checkOutDate: bookingData.checkOutDate,
        numberOfNights: bookingData.numberOfNights
      });
    } else {
      Alert.alert('Selection Required', 'Please select a package category first.');
    }
  };

  // Handle Quick Scenario Press
  const handleQuickScenarioPress = (scenario) => {
    console.log('Quick Scenario selected:', scenario.title);
    
    // Find package by category
    const pkg = packages.find(p => p.category === scenario.category);
    
    if (pkg) {
      navigation.navigate('PackageDetail', { 
        packageId: pkg._id,
        ...(selectedDates && { ...selectedDates })
      });
    } else {
      Alert.alert('Coming Soon', `${scenario.title} will be available soon!`);
    }
  };

  // Handle Service/Package Press
  const handlePackagePress = (pkg) => {
    console.log('Package selected:', pkg.name);
    navigation.navigate('PackageDetail', { 
      packageId: pkg._id,
      ...(selectedDates && { ...selectedDates })
    });
  };

  // Get category color
  const getCategoryColor = (category) => {
    const colors_map = {
      full_venue: '#0D34B7',
      function_hall_dining: '#E74C3C',
      function_hall_only: '#F39C12',
      rooms_dining_mini_hall: '#27AE60',
      rooms_mini_hall: '#3498DB',
      mini_hall: '#9B59B6',
      rooms_only: '#1ABC9C'
    };
    return colors_map[category] || colors.primary;
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
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Blue Background Section */}
        <View style={[styles.blueSection, { paddingTop: spacing.lg + insets.top }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Hello, {user?.fullName?.split(' ')[0] || 'Guest'}</Text>
              <Text style={styles.subGreeting}>Welcome to Mathur Vaishya Bhavan</Text>
            </View>
            <TouchableOpacity style={styles.notificationIcon}>
              <Ionicons name="notifications-outline" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>

          {/* Booking Widget */}
          <BookingWidget onCheckAvailability={handleCheckAvailability} />
        </View>

        {/* White Background Section */}
        <View style={styles.whiteSection}>
          {/* Quick Scenarios */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Scenarios</Text>
            
            <View style={styles.scenariosGrid}>
              {quickScenarios.map((scenario) => (
                <TouchableOpacity
                  key={scenario.id}
                  style={styles.scenarioCard}
                  onPress={() => handleQuickScenarioPress(scenario)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.scenarioIcon, { backgroundColor: scenario.color + '15' }]}>
                    <Ionicons name={scenario.icon} size={28} color={scenario.color} />
                  </View>
                  <Text style={styles.scenarioTitle}>{scenario.title}</Text>
                  <Text style={styles.scenarioSubtitle}>{scenario.subtitle}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Services (All Packages) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Services</Text>
            
            {loadingPackages ? (
              <View style={styles.packagesLoading}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.packagesLoadingText}>Loading services...</Text>
              </View>
            ) : (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.servicesScroll}
              >
                {packages.map((pkg) => {
                  const priceText = pkg.pricing.basePrice === 0 
                    ? 'Price varies'
                    : `₹${pkg.pricing.basePrice.toLocaleString('en-IN')} Onwards`;

                  return (
                    <TouchableOpacity
                      key={pkg._id}
                      style={styles.serviceCard}
                      onPress={() => handlePackagePress(pkg)}
                      activeOpacity={0.7}
                    >
                      {/* Image */}
                      <View style={styles.serviceImageContainer}>
                        {pkg.images && pkg.images.length > 0 ? (
                          <Image 
                            source={{ uri: pkg.images[0] }} 
                            style={styles.serviceImage} 
                          />
                        ) : (
                          <View style={[styles.serviceImagePlaceholder, { backgroundColor: getCategoryColor(pkg.category) + '20' }]}>
                            <Ionicons 
                              name="business" 
                              size={32} 
                              color={getCategoryColor(pkg.category)} 
                            />
                          </View>
                        )}
                      </View>

                      {/* Info */}
                      <View style={styles.serviceInfo}>
                        <Text style={styles.serviceName} numberOfLines={1}>
                          {pkg.name.replace(' Booking', '').replace(' Package', '')}
                        </Text>
                        <Text style={styles.serviceDescription} numberOfLines={2}>
                          {pkg.shortDescription || pkg.description}
                        </Text>
                        <Text style={styles.servicePrice}>{priceText}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
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
    backgroundColor: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // Blue Section (30%)
  blueSection: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl + spacing.lg,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  subGreeting: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // White Section (70%)
  whiteSection: {
    backgroundColor: colors.white,
    flex: 1,
    marginTop: -spacing.xl,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: spacing.lg,
  },

  // Section
  section: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },

  // Quick Scenarios Grid
  scenariosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  scenarioCard: {
    width: (width - spacing.lg * 2 - spacing.md) / 2,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    
    // Shadow for Android
    elevation: 2,
    
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  scenarioIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  scenarioTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  scenarioSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },

  // Services Scroll
  servicesScroll: {
    paddingRight: spacing.lg,
  },
  packagesLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  packagesLoadingText: {
    marginLeft: spacing.sm,
    fontSize: 14,
    color: colors.textSecondary,
  },

  // Service Card
  serviceCard: {
    width: 280,
    backgroundColor: colors.white,
    borderRadius: 12,
    marginRight: spacing.md,
    overflow: 'hidden',
    
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    
    // Shadow for Android
    elevation: 3,
  },
  serviceImageContainer: {
    width: '100%',
    height: 140,
  },
  serviceImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  serviceImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceInfo: {
    padding: spacing.md,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  serviceDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.sm,
    height: 36, // Fixed height for 2 lines
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});

export default HomeScreen;