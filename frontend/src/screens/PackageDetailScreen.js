/**
 * PackageDetailScreen
 * Displays detailed information about a selected package
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../styles/colors';
import spacing from '../styles/spacing';
import packageService from '../services/api/packages';
import LoadingScreen from '../components/common/LoadingScreen';
import ContactModal from '../components/common/ContactModal';

const { width } = Dimensions.get('window');
const IMAGE_WIDTH = width;
const IMAGE_HEIGHT = 200;

const PackageDetailScreen = ({ route, navigation }) => {
  const { packageId, packageName } = route.params;
  const insets = useSafeAreaInsets();

  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);
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
    setShowContactModal(true);
  };

  if (loading) {
    return <LoadingScreen message="Loading package details..." />;
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

  // Prepare images for display
  const placeholderText = packageData?.name
    ? packageData.name.split(' ').slice(0, 2).join('+') || 'Package'
    : 'Package';

  const images =
    packageData.images && packageData.images.length > 0
      ? packageData.images.map((img, index) => ({
          id: index.toString(),
          uri: img,
        }))
      : [
          {
            id: '1',
            uri: `https://placehold.co/800x400/0D34B7/FFFFFF?text=${placeholderText}`,
          },
        ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + spacing.sm, paddingBottom: spacing.sm },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {packageData.name.replace(' Booking', '').replace(' Package', '')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Scrollable Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <View style={styles.imageContainer}>
          <FlatList
            ref={flatListRef}
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleImageScroll}
            scrollEventThrottle={16}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item.uri }}
                style={styles.image}
                resizeMode="cover"
              />
            )}
          />
          {images.length > 1 && (
            <View style={styles.pagination}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === currentImageIndex && styles.paginationDotActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Package Information */}
        <View style={styles.infoContainer}>
          {/* Package Name & Category */}
          <View style={styles.section}>
            <Text style={styles.packageName}>{packageData.name}</Text>
            {packageData.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>
                  {packageData.category.replace(/_/g, ' ').toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          {/* Description */}
          {packageData.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.descriptionText}>
                {packageData.description}
              </Text>
            </View>
          )}

          {/* Included Facilities */}
          {packageData.includes?.facilities &&
            packageData.includes.facilities.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Facilities Included</Text>
                {packageData.includes.facilities.map((facility, index) => (
                  <View key={index} style={styles.facilitiesItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.success}
                    />
                    <Text style={styles.facilitiesText}>{facility}</Text>
                  </View>
                ))}
              </View>
            )}

          {/* Included Resources */}
          {packageData.includes?.resources &&
            packageData.includes.resources.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Included Resources</Text>
                {packageData.includes.resources.map((resourceItem, index) => (
                  <View key={index} style={styles.resourceCard}>
                    <View style={styles.resourceHeader}>
                      <Ionicons
                        name={
                          resourceItem.resource.facilityType === 'guest_room'
                            ? 'bed'
                            : resourceItem.resource.facilityType === 'banquet_hall'
                            ? 'business'
                            : 'cube'
                        }
                        size={24}
                        color={colors.primary}
                      />
                      <View style={styles.resourceInfo}>
                        <Text style={styles.resourceName}>
                          {resourceItem.resource.name}
                        </Text>
                        <Text style={styles.resourceCapacity}>
                          Capacity: {resourceItem.resource.capacity} people
                        </Text>
                      </View>
                    </View>
                    {resourceItem.quantity > 1 && (
                      <Text style={styles.resourceQuantity}>
                        Quantity: {resourceItem.quantity}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}

          {/* Terms & Conditions */}
          {packageData.termsAndConditions &&
            packageData.termsAndConditions.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Terms & Conditions</Text>
                {packageData.termsAndConditions.map((term, index) => (
                  <View key={index} style={styles.termItem}>
                    <View style={styles.termBullet} />
                    <Text style={styles.termText}>{term}</Text>
                  </View>
                ))}
              </View>
            )}

          {/* Pricing */}
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
                            ₹{' '}
                            {resource.resource.basePrice?.toLocaleString(
                              'en-IN'
                            ) || 'N/A'}{' '}
                            / night
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

        {/* Bottom Spacing for fixed button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Sticky Bar */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: insets.bottom + spacing.sm },
        ]}
      >
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

      {/* Contact Modal */}
      <ContactModal
        visible={showContactModal}
        onClose={() => setShowContactModal(false)}
        packageName={packageData.name}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
    marginHorizontal: spacing.md,
  },
  content: {
    flex: 1,
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
    padding: spacing.xl,
  },
  errorText: {
    fontSize: 18,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    textAlign: 'center',
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
  imageContainer: {
    height: IMAGE_HEIGHT,
    backgroundColor: colors.border,
    position: 'relative',
  },
  image: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
  },
  pagination: {
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
  infoContainer: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  packageName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.radiusSm,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  descriptionText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  facilitiesItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  facilitiesText: {
    fontSize: 15,
    color: colors.text,
    marginLeft: spacing.sm,
    flex: 1,
  },
  resourceCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resourceInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  resourceName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  resourceCapacity: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  resourceQuantity: {
    fontSize: 14,
    color: colors.primary,
    marginTop: spacing.sm,
    fontWeight: '500',
  },
  termItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  termBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textSecondary,
    marginTop: 8,
    marginRight: spacing.sm,
  },
  termText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
    lineHeight: 20,
  },
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
