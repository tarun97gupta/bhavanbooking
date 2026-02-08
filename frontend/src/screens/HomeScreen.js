/**
 * HomeScreen
 * Main landing screen with carousel, about section, package selector, and contact info
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import packageService from '../services/api/packages';
import colors from '../styles/colors';
import spacing from '../styles/spacing';
import { CAROUSEL_IMAGES, APP_CONFIG } from '../constants/app';

// Component imports
import LoadingScreen from '../components/common/LoadingScreen';
import ImageCarousel from '../components/common/ImageCarousel';
import EnhancedHeader from '../components/home/EnhancedHeader';
import AboutSection from '../components/home/AboutSection';
import AboutModal from '../components/home/AboutModal';
import PackageSelector from '../components/home/PackageSelector';
import PackageSelectionModal from '../components/home/PackageSelectionModal';
import QuickScenarios from '../components/home/QuickScenarios';
import ContactSection from '../components/home/ContactSection';

const HomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  
  // State
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);

  // Fetch packages on mount
  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const result = await packageService.fetchPackages();
      setPackages(result.packages);
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPackages();
    setRefreshing(false);
  };

  const handlePackagePress = (pkg) => {
    navigation.navigate('PackageDetail', {
      packageId: pkg._id,
      packageName: pkg.name,
    });
  };

  const handleViewPackageDetail = () => {
    if (!selectedPackage) {
      Alert.alert('Selection Required', 'Please select a package first.');
      return;
    }
    const pkg = packages.find((p) => p._id === selectedPackage);
    if (pkg) {
      handlePackagePress(pkg);
    }
  };

  const handleQuickScenarioPress = (scenario) => {
    const pkg = packages.find((p) => p.category === scenario.category);
    if (pkg) {
      handlePackagePress(pkg);
    }
  };

  // Loading state
  if (loading) {
    return <LoadingScreen message="Loading packages..." />;
  }

  return (
    <View style={styles.container}>
      {/* Enhanced Header */}
      <EnhancedHeader paddingTop={insets.top + spacing.md} />

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Image Carousel */}
        <ImageCarousel
          images={CAROUSEL_IMAGES}
          autoScroll={true}
          autoScrollInterval={APP_CONFIG.carouselAutoScrollInterval}
          height={250}
        />

        {/* About Bhavan Section */}
        <AboutSection onReadMore={() => setShowDescriptionModal(true)} />

        {/* Package Selection Widget */}
        <PackageSelector
          packages={packages}
          selectedPackage={selectedPackage}
          onSelectPress={() => setShowPackageModal(true)}
          onViewDetailPress={handleViewPackageDetail}
        />

        {/* Quick Scenarios */}
        <QuickScenarios onScenarioPress={handleQuickScenarioPress} />

        {/* Contact Section */}
        <ContactSection />

        {/* Bottom Spacing */}
        <View style={{ height: spacing.xl }} />
      </ScrollView>

      {/* Package Selection Modal */}
      <PackageSelectionModal
        visible={showPackageModal}
        onClose={() => setShowPackageModal(false)}
        packages={packages}
        selectedPackage={selectedPackage}
        onSelectPackage={setSelectedPackage}
      />

      {/* About Description Modal */}
      <AboutModal
        visible={showDescriptionModal}
        onClose={() => setShowDescriptionModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
});

export default HomeScreen;
