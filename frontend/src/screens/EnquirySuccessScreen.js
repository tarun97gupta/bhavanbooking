import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../styles/colors';
import spacing from '../styles/spacing';

const EnquirySuccessScreen = ({ route, navigation }) => {
  const { enquiryData } = route.params;
  const insets = useSafeAreaInsets();

  const contactDetails = {
    phone: '+91 98765 43210',
    email: 'info@darussalambhavan.com',
    address: '14-1-378, Darus Salam, Aghapura, Hyderabad, Telangana 500006',
    whatsapp: '+919876543210',
  };

  const handleCall = () => {
    Linking.openURL(`tel:${contactDetails.phone}`);
  };

  const handleWhatsApp = () => {
    Linking.openURL(`https://wa.me/${contactDetails.whatsapp.replace(/\+/g, '')}`);
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${contactDetails.email}`);
  };

  const handleBackToHome = () => {
    navigation.navigate('Home');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Success Icon & Message */}
      <View style={styles.successHeader}>
        <View style={styles.successIconContainer}>
          <Ionicons name="checkmark-circle" size={80} color={colors.success || '#27AE60'} />
        </View>
        <Text style={styles.successTitle}>Enquiry Submitted!</Text>
        <Text style={styles.successMessage}>
          Thank you for your interest. We'll get back to you soon.
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
      >
        {/* Enquiry Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Enquiry Details</Text>
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Package</Text>
              <Text style={styles.detailValue}>{enquiryData.packageName}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Name</Text>
              <Text style={styles.detailValue}>{enquiryData.name}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Phone</Text>
              <Text style={styles.detailValue}>{enquiryData.phoneNumber}</Text>
            </View>
            {enquiryData.email && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Email</Text>
                <Text style={styles.detailValue}>{enquiryData.email}</Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Check-in</Text>
              <Text style={styles.detailValue}>{enquiryData.checkInDate}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Check-out</Text>
              <Text style={styles.detailValue}>{enquiryData.checkOutDate}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>
                {enquiryData.numberOfNights} Night{enquiryData.numberOfNights !== 1 ? 's' : ''}
              </Text>
            </View>
            {enquiryData.visitingFrom && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Visiting From</Text>
                <Text style={styles.detailValue}>{enquiryData.visitingFrom}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Contact Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.contactCard}>
            {/* Phone */}
            <TouchableOpacity
              style={styles.contactItem}
              onPress={handleCall}
              activeOpacity={0.7}
            >
              <View style={[styles.contactIconContainer, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="call" size={24} color="#27AE60" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Call Us</Text>
                <Text style={styles.contactValue}>{contactDetails.phone}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* WhatsApp */}
            <TouchableOpacity
              style={styles.contactItem}
              onPress={handleWhatsApp}
              activeOpacity={0.7}
            >
              <View style={[styles.contactIconContainer, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>WhatsApp</Text>
                <Text style={styles.contactValue}>{contactDetails.whatsapp}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* Email */}
            <TouchableOpacity
              style={styles.contactItem}
              onPress={handleEmail}
              activeOpacity={0.7}
            >
              <View style={[styles.contactIconContainer, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="mail" size={24} color="#2196F3" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValue}>{contactDetails.email}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* Address */}
            <View style={styles.contactItem}>
              <View style={[styles.contactIconContainer, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="location" size={24} color="#FF9800" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Address</Text>
                <Text style={styles.contactValue}>{contactDetails.address}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Info Note */}
        <View style={styles.infoNote}>
          <Ionicons name="information-circle" size={20} color={colors.primary} />
          <Text style={styles.infoText}>
            Our team will review your enquiry and contact you within 24 hours to confirm availability and discuss further details.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.sm }]}>
        <TouchableOpacity
          style={styles.homeButton}
          onPress={handleBackToHome}
          activeOpacity={0.8}
        >
          <Ionicons
            name="home"
            size={20}
            color={colors.white}
            style={{ marginRight: spacing.sm }}
          />
          <Text style={styles.homeButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  successHeader: {
    backgroundColor: colors.white,
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  successIconContainer: {
    marginBottom: spacing.md,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  successMessage: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  detailsCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  contactCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  contactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  infoNote: {
    flexDirection: 'row',
    backgroundColor: colors.primaryLight || '#E8EEFB',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: spacing.radiusMd,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    marginLeft: spacing.sm,
    lineHeight: 19,
  },
  bottomBar: {
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
  homeButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md + 2,
    borderRadius: spacing.radiusMd,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EnquirySuccessScreen;

