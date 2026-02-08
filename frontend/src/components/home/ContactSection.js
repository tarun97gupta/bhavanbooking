/**
 * ContactSection Component
 * Displays contact information with interactive cards
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import { CONTACT_INFO, BUSINESS_HOURS } from '../../constants/app';
import { openPhoneCall, openWhatsApp, openEmail, openMaps } from '../../utils/linkHelpers';

const { width } = Dimensions.get('window');

const ContactSection = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Get in Touch</Text>
      <Text style={styles.subtitle}>
        We're here to help make your event memorable
      </Text>

      {/* Contact Method Cards */}
      <View style={styles.methodsGrid}>
        {/* Phone Card */}
        <TouchableOpacity
          style={[styles.methodCard, { backgroundColor: '#E3F2FD' }]}
          onPress={openPhoneCall}
          activeOpacity={0.8}
        >
          <View style={[styles.methodIcon, { backgroundColor: colors.primary }]}>
            <Ionicons name="call" size={24} color={colors.white} />
          </View>
          <Text style={styles.methodTitle}>Call Us</Text>
          <Text style={styles.methodValue}>{CONTACT_INFO.phone}</Text>
        </TouchableOpacity>

        {/* WhatsApp Card */}
        <TouchableOpacity
          style={[styles.methodCard, { backgroundColor: '#E7F8F0' }]}
          onPress={() => openWhatsApp()}
          activeOpacity={0.8}
        >
          <View style={[styles.methodIcon, { backgroundColor: '#25D366' }]}>
            <Ionicons name="logo-whatsapp" size={24} color={colors.white} />
          </View>
          <Text style={styles.methodTitle}>WhatsApp</Text>
          <Text style={styles.methodValue}>Chat Now</Text>
        </TouchableOpacity>
      </View>

      {/* Email Card - Full Width */}
      <TouchableOpacity
        style={styles.emailCard}
        onPress={() => openEmail()}
        activeOpacity={0.8}
      >
        <View style={[styles.methodIcon, { backgroundColor: '#F57C00' }]}>
          <Ionicons name="mail" size={24} color={colors.white} />
        </View>
        <View style={styles.emailContent}>
          <Text style={styles.methodTitle}>Email Us</Text>
          <Text style={styles.methodValue}>{CONTACT_INFO.email}</Text>
        </View>
        <Ionicons name="arrow-forward" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      {/* Location Card with Map Link */}
      <View style={styles.locationCard}>
        <View style={styles.locationHeader}>
          <View style={[styles.methodIcon, { backgroundColor: colors.accent }]}>
            <Ionicons name="location" size={24} color={colors.black} />
          </View>
          <View style={styles.locationTextContainer}>
            <Text style={styles.methodTitle}>Our Location</Text>
            <Text style={styles.locationAddress}>{CONTACT_INFO.address}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.mapButton}
          onPress={openMaps}
          activeOpacity={0.8}
        >
          <Ionicons name="navigate" size={18} color={colors.white} />
          <Text style={styles.mapButtonText}>Get Directions</Text>
        </TouchableOpacity>
      </View>

      {/* Business Hours Card */}
      <View style={styles.businessHoursCard}>
        <View style={styles.businessHoursHeader}>
          <Ionicons name="time" size={24} color={colors.primary} />
          <Text style={styles.businessHoursTitle}>Business Hours</Text>
        </View>
        <View style={styles.businessHoursRow}>
          <Text style={styles.businessHoursDay}>{BUSINESS_HOURS.title}</Text>
          <Text style={styles.businessHoursTime}>{BUSINESS_HOURS.hours}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: spacing.lg,
    marginTop: 0,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    marginTop: -spacing.xs,
  },
  methodsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  methodCard: {
    width: (width - spacing.lg * 2 - spacing.sm) / 2,
    padding: spacing.lg,
    borderRadius: spacing.radiusMd,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  methodIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  methodTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  methodValue: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: spacing.lg,
    borderRadius: spacing.radiusMd,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emailContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  locationCard: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: spacing.radiusMd,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  locationTextContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  locationAddress: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: 4,
  },
  mapButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.radiusMd,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  businessHoursCard: {
    backgroundColor: '#F9FAFB',
    padding: spacing.lg,
    borderRadius: spacing.radiusMd,
  },
  businessHoursHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  businessHoursTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: spacing.sm,
  },
  businessHoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  businessHoursDay: {
    fontSize: 14,
    color: colors.text,
  },
  businessHoursTime: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});

export default ContactSection;
