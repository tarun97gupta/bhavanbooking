import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../styles/colors';
import spacing from '../styles/spacing';
import packageService from '../services/api/packages';

const { width } = Dimensions.get('window');
const IMAGE_WIDTH = width;
const IMAGE_HEIGHT = 200;

const PackageDetailScreen = ({ route, navigation }) => {
  const { packageId, packageName } = route.params;
  const insets = useSafeAreaInsets();

  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const flatListRef = useRef(null);

  useEffect(() => {
    loadPackageDetails();
  }, [packageId]);

  const loadPackageDetails = async () => {
    try {
      setLoading(true);
      const result = await packageService.fetchPackageById(packageId);
      setPackageData(result.package);
    } catch (error) {
      console.error('Error loading package:', error);
      Alert.alert('Error', error.message || 'Failed to load package details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleImageScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / IMAGE_WIDTH);
    setCurrentImageIndex(index);
  };

  const handleEnquireNow = () => {
    navigation.navigate('EnquiryForm', {
      packageId: packageData._id,
      packageName: packageData.name,
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading package details...</Text>
      </View>
    );
  }

  if (!packageData) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
        <Text style={styles.errorText}>Package not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Images array - only computed when packageData is available
  const placeholderText = packageData?.name 
    ? packageData.name.split(' ').slice(0, 2).join('+')
    : 'Package';
  
  const images =
    packageData?.images && packageData.images.length > 0
      ? packageData.images
      : [`https://placehold.co/400x200/0D34B7/FFFFFF?text=${placeholderText}`];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {packageName?.replace(' Booking', '').replace(' Package', '') || 'Package Details'}
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Image Carousel */}
        <View style={styles.imageCarouselContainer}>
          <FlatList
            ref={flatListRef}
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleImageScroll}
            scrollEventThrottle={16}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.carouselImage} />
            )}
          />

          {/* Pagination Dots */}
          <View style={styles.paginationContainer}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  currentImageIndex === index && styles.paginationDotActive,
                ]}
              />
            ))}
            {images.length > 1 && (
              <View style={styles.paginationCount}>
                <Text style={styles.paginationCountText}>
                  {currentImageIndex + 1}/{images.length}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Content Container */}
        <View style={styles.contentContainer}>
          {/* Package Info */}
          <View style={styles.section}>
            <Text style={styles.packageName}>
              {packageData.name.replace(' Booking', '').replace(' Package', '')}
            </Text>
            <Text style={styles.packageDescription}>
              {packageData.description}
            </Text>

            {/* Address */}
            <View style={styles.addressContainer}>
              <Ionicons
                name="location-outline"
                size={16}
                color={colors.textSecondary}
              />
              <Text style={styles.addressText}>
                14-1-378, Darus Salam, Aghapura, Hyderabad, Telangana 500006
              </Text>
            </View>
          </View>

          {/* Details & Amenities */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Details & Amenities</Text>

            <View style={styles.amenitiesGrid}>
              {/* Capacity */}
              {packageData.includes?.resources?.some((r) => r.resource.capacity) && (
                <View style={styles.amenityItem}>
                  <Ionicons name="people-outline" size={20} color={colors.text} />
                  <Text style={styles.amenityText}>
                    {packageData.includes.resources.reduce(
                      (max, r) => Math.max(max, r.resource.capacity || 0),
                      0
                    )}{' '}
                    people
                  </Text>
                </View>
              )}

              {/* Stage available (for halls) */}
              {packageData.category.includes('hall') && (
                <View style={styles.amenityItem}>
                  <Ionicons name="easel-outline" size={20} color={colors.text} />
                  <Text style={styles.amenityText}>Stage available</Text>
                </View>
              )}

              {/* AC Available */}
              <View style={styles.amenityItem}>
                <Ionicons name="snow-outline" size={20} color={colors.text} />
                <Text style={styles.amenityText}>AC Available</Text>
              </View>

              {/* Rooms */}
              {packageData.includes?.resources?.filter(
                (r) => r.resource.facilityType === 'guest_room'
              ).length > 0 && (
                <View style={styles.amenityItem}>
                  <Ionicons name="bed-outline" size={20} color={colors.text} />
                  <Text style={styles.amenityText}>
                    {packageData.includes.resources
                      .filter((r) => r.resource.facilityType === 'guest_room')
                      .reduce((sum, r) => sum + r.quantity, 0)}{' '}
                    rooms available
                  </Text>
                </View>
              )}

              {/* Parking */}
              <View style={styles.amenityItem}>
                <Ionicons name="car-outline" size={20} color={colors.text} />
                <Text style={styles.amenityText}>Parking Available</Text>
              </View>

              {/* Kitchen */}
              {packageData.includes?.dining && (
                <View style={styles.amenityItem}>
                  <Ionicons name="restaurant-outline" size={20} color={colors.text} />
                  <Text style={styles.amenityText}>Kitchen Available</Text>
                </View>
              )}
            </View>
          </View>

          {/* Rules and Regulations */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rules and Regulations</Text>

            {packageData.termsAndConditions &&
            packageData.termsAndConditions.length > 0 ? (
              packageData.termsAndConditions.map((rule, index) => (
                <View key={index} style={styles.ruleItem}>
                  <Ionicons
                    name="checkmark-outline"
                    size={18}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.ruleText}>{rule}</Text>
                </View>
              ))
            ) : (
              <>
                <View style={styles.ruleItem}>
                  <Ionicons name="close-outline" size={18} color={colors.error} />
                  <Text style={styles.ruleText}>
                    Alcohol consumption NOT allowed
                  </Text>
                </View>
                <View style={styles.ruleItem}>
                  <Ionicons
                    name="checkmark-outline"
                    size={18}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.ruleText}>
                    ID proof required for check-in
                  </Text>
                </View>
                <View style={styles.ruleItem}>
                  <Ionicons
                    name="checkmark-outline"
                    size={18}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.ruleText}>Advance payment required</Text>
                </View>
              </>
            )}
          </View>

          {/* Pricing Info */}
          {packageData.pricing && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pricing</Text>
              {packageData.pricing.basePrice > 0 ? (
                <View style={styles.priceCard}>
                  <Text style={styles.priceLabel}>Starting from</Text>
                  <Text style={styles.priceValue}>
                    ₹ {packageData.pricing.basePrice.toLocaleString('en-IN')}
                  </Text>
                  <Text style={styles.priceNote}>
                    *Final price may vary based on dates and requirements
                  </Text>
                </View>
              ) : (
                <View style={styles.priceCard}>
                  <Text style={styles.priceLabel}>Per Room Pricing</Text>
                  <View style={styles.roomPricingContainer}>
                    {packageData.includes?.resources
                      ?.filter((r) => r.resource.facilityType === 'guest_room')
                      .map((resource, index) => (
                        <View key={index} style={styles.roomPriceItem}>
                          <Text style={styles.roomType}>
                            {resource.resource.category || 'Room'}
                          </Text>
                          <Text style={styles.roomPrice}>
                            ₹ {resource.resource.basePrice?.toLocaleString('en-IN') || 'N/A'} / night
                          </Text>
                        </View>
                      ))}
                  </View>
                  <Text style={styles.priceNote}>
                    *Prices shown are per room per night
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Sticky Bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.sm }]}>
        <TouchableOpacity
          style={styles.enquireButton}
          onPress={handleEnquireNow}
          activeOpacity={0.8}
        >
          <Ionicons
            name="chatbubble-ellipses"
            size={20}
            color={colors.black}
            style={{ marginRight: spacing.sm }}
          />
          <Text style={styles.enquireButtonText}>Enquire Now</Text>
        </TouchableOpacity>
      </View>
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
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xl,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: spacing.radiusMd,
  },
  backButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },

  // Header
  header: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },

  // Image Carousel
  imageCarouselContainer: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    position: 'relative',
  },
  carouselImage: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    resizeMode: 'cover',
  },
  paginationContainer: {
    position: 'absolute',
    bottom: spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: colors.white,
    width: 24,
  },
  paginationCount: {
    position: 'absolute',
    right: spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paginationCountText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },

  // Content
  contentContainer: {
    backgroundColor: colors.white,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  // Package Info
  packageName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  packageDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
    flex: 1,
    lineHeight: 18,
  },

  // Section Title
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },

  // Amenities Grid
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  amenityItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
  },
  amenityText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: spacing.sm,
    flex: 1,
  },

  // Rules
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  ruleText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: spacing.sm,
    flex: 1,
    lineHeight: 20,
  },

  // Pricing
  priceCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: spacing.radiusMd,
    padding: spacing.lg,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  priceNote: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  roomPricingContainer: {
    marginVertical: spacing.sm,
  },
  roomPriceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  roomType: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  roomPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',

    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,

    // Shadow for Android
    elevation: 8,
  },
  enquireButton: {
    flexDirection: 'row',
    backgroundColor: colors.accent,
    paddingVertical: spacing.md + 2,
    borderRadius: spacing.radiusMd,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enquireButtonText: {
    color: colors.black,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PackageDetailScreen;

