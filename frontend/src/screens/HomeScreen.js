import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  Alert,
  Modal,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../styles/colors';
import spacing from '../styles/spacing';
import packageService from '../services/api/packages';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showPackageModal, setShowPackageModal] = useState(false);

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
    
    const pkg = packages.find(p => p._id === selectedPackage);
    if (pkg) {
      handlePackagePress(pkg);
    }
  };

  // Quick Scenarios
  const quickScenarios = [
    {
      id: 1,
      title: 'Full Bhavan',
      icon: 'business',
      color: '#0D34B7',
      category: 'full_venue',
    },
    {
      id: 2,
      title: 'Function Hall',
      icon: 'people',
      color: '#E74C3C',
      category: 'function_hall_dining',
    },
    {
      id: 3,
      title: 'Book Stays',
      icon: 'bed',
      color: '#27AE60',
      category: 'rooms_only',
    },
    {
      id: 4,
      title: 'Meeting Room',
      icon: 'briefcase',
      color: '#F39C12',
      category: 'mini_hall',
    },
  ];

  const handleQuickScenarioPress = (scenario) => {
    const pkg = packages.find((p) => p.category === scenario.category);
    if (pkg) {
      handlePackagePress(pkg);
    }
  };

  const handlePhoneCall = () => {
    Linking.openURL('tel:+919876543210');
  };

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/919876543210');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:info@darussalambhavan.com');
  };

  const getCategoryColor = (category) => {
    const colorMap = {
      full_venue: '#0D34B7',
      function_hall_dining: '#E74C3C',
      rooms_dining_mini_hall: '#27AE60',
      rooms_mini_hall: '#27AE60',
      function_hall_only: '#E74C3C',
      mini_hall: '#F39C12',
      rooms_only: '#27AE60',
    };
    return colorMap[category] || colors.primary;
  };

  const getCategoryIcon = (category) => {
    const iconMap = {
      full_venue: 'business',
      function_hall_dining: 'people',
      rooms_dining_mini_hall: 'bed',
      rooms_mini_hall: 'bed',
      function_hall_only: 'people',
      mini_hall: 'briefcase',
      rooms_only: 'bed',
    };
    return iconMap[category] || 'cube';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading packages...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
        <View>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.bhavanText}>Darus Salam Bhavan</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Package Selection Widget */}
        <View style={styles.packageWidget}>
          <Text style={styles.widgetTitle}>Select Package</Text>
          
          {/* Package Dropdown */}
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowPackageModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.dropdownContent}>
              <Ionicons 
                name={selectedPackage ? getCategoryIcon(packages.find(p => p._id === selectedPackage)?.category) : 'cube-outline'} 
                size={24} 
                color={colors.primary} 
              />
              <Text style={styles.dropdownText}>
                {selectedPackage 
                  ? packages.find(p => p._id === selectedPackage)?.name.replace(' Booking', '').replace(' Package', '')
                  : 'Select a package'
                }
              </Text>
            </View>
            <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* View Package Detail Button */}
          <TouchableOpacity
            style={[
              styles.viewDetailButton,
              !selectedPackage && styles.viewDetailButtonDisabled
            ]}
            onPress={handleViewPackageDetail}
            disabled={!selectedPackage}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.viewDetailButtonText,
              !selectedPackage && styles.viewDetailButtonTextDisabled
            ]}>
              View Package Details
            </Text>
            <Ionicons 
              name="arrow-forward" 
              size={20} 
              color={!selectedPackage ? colors.textSecondary : colors.black} 
            />
          </TouchableOpacity>
        </View>

        {/* Quick Scenarios */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Scenarios</Text>
          <View style={styles.scenariosGrid}>
            {quickScenarios.map((scenario) => (
              <TouchableOpacity
                key={scenario.id}
                style={[styles.scenarioCard, { backgroundColor: scenario.color }]}
                onPress={() => handleQuickScenarioPress(scenario)}
                activeOpacity={0.8}
              >
                <Ionicons name={scenario.icon} size={32} color={colors.white} />
                <Text style={styles.scenarioTitle}>{scenario.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Contact Info */}
        <View style={[styles.section, {marginTop : -50}]}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.contactCard}>
            <View style={styles.contactItem}>
              <Ionicons name="location" size={20} color={colors.primary} />
              <Text style={styles.contactText}>
                14-1-378, Darus Salam, Aghapura, Hyderabad
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.contactItem}
              onPress={handlePhoneCall}
              activeOpacity={0.7}
            >
              <Ionicons name="call" size={20} color={colors.primary} />
              <Text style={[styles.contactText, styles.clickableText]}>+91 98765 43210</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.contactItem}
              onPress={handleWhatsApp}
              activeOpacity={0.7}
            >
              <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
              <Text style={[styles.contactText, styles.clickableText]}>+91 98765 43210</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.contactItem, { marginBottom: 0 }]}
              onPress={handleEmail}
              activeOpacity={0.7}
            >
              <Ionicons name="mail" size={20} color={colors.primary} />
              <Text style={[styles.contactText, styles.clickableText]}>info@darussalambhavan.com</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: spacing.xl }} />
      </ScrollView>

      {/* Package Selection Modal */}
      <Modal
        visible={showPackageModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPackageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Package</Text>
              <TouchableOpacity onPress={() => setShowPackageModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {packages.map((pkg) => (
                <TouchableOpacity
                  key={pkg._id}
                  style={[
                    styles.modalOption,
                    selectedPackage === pkg._id && styles.modalOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedPackage(pkg._id);
                    setShowPackageModal(false);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.modalOptionContent}>
                    <Ionicons
                      name={getCategoryIcon(pkg.category)}
                      size={24}
                      color={selectedPackage === pkg._id ? colors.primary : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.modalOptionText,
                        selectedPackage === pkg._id && styles.modalOptionTextSelected,
                      ]}
                    >
                      {pkg.name.replace(' Booking', '').replace(' Package', '')}
                    </Text>
                  </View>
                  {selectedPackage === pkg._id && (
                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
  },
  bhavanText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.white,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  packageWidget: {
    backgroundColor: colors.white,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: spacing.radiusMd,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  widgetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: spacing.radiusMd,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dropdownText: {
    fontSize: 15,
    color: colors.text,
    marginLeft: spacing.md,
    flex: 1,
  },
  viewDetailButton: {
    flexDirection: 'row',
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: spacing.radiusMd,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  viewDetailButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.black,
    marginRight: spacing.sm,
  },
  viewDetailButtonDisabled: {
    backgroundColor: '#E5E7EB',
    opacity: 0.6,
  },
  viewDetailButtonTextDisabled: {
    color: colors.textSecondary,
  },
  section: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  scenariosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  scenarioCard: {
    width: (width - spacing.lg * 2 - spacing.xs * 2) / 2,
    aspectRatio: 1,
    borderRadius: spacing.radiusMd,
    padding: spacing.md,
    margin: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scenarioTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  contactCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  contactText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: spacing.md,
    flex: 1,
  },
  clickableText: {
    textDecorationLine: 'underline',
    color: colors.primary,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  modalBody: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalOptionSelected: {
    backgroundColor: '#F0F7FF',
  },
  modalOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalOptionText: {
    fontSize: 15,
    color: colors.text,
    marginLeft: spacing.md,
    flex: 1,
  },
  modalOptionTextSelected: {
    fontWeight: '600',
    color: colors.primary,
  },
});

export default HomeScreen;

