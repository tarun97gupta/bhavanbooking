/**
 * ContactModal Component
 * Modal displaying contact options (WhatsApp, Call, Email) and location
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import { CONTACT_INFO } from '../../constants/app';
import { openPhoneCall, openWhatsApp, openEmail, openMaps } from '../../utils/linkHelpers';

const ContactModal = ({ visible, onClose, packageName = '' }) => {
  const handleWhatsAppPress = () => {
    const message = packageName 
      ? `Hi, I'm interested in ${packageName}`
      : 'Hi, I would like to know more about your services';
    openWhatsApp(message);
  };

  const handleEmailPress = () => {
    const subject = packageName 
      ? `Enquiry about ${packageName}`
      : 'Enquiry about services';
    const body = packageName
      ? `Hi,\n\nI would like to know more about ${packageName}.\n\nThank you!`
      : 'Hi,\n\nI would like to know more about your services.\n\nThank you!';
    openEmail(subject, body);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Contact Us</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Contact Options */}
          <View style={styles.contactOptionsContainer}>
            {/* WhatsApp */}
            <TouchableOpacity
              style={styles.contactOption}
              onPress={handleWhatsAppPress}
              activeOpacity={0.7}
            >
              <View style={[styles.contactIconContainer, { backgroundColor: '#E7F8F0' }]}>
                <Ionicons name="logo-whatsapp" size={28} color="#25D366" />
              </View>
              <View style={styles.contactOptionText}>
                <Text style={styles.contactOptionTitle}>WhatsApp</Text>
                <Text style={styles.contactOptionSubtitle}>{CONTACT_INFO.whatsapp}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* Phone Call */}
            <TouchableOpacity
              style={styles.contactOption}
              onPress={openPhoneCall}
              activeOpacity={0.7}
            >
              <View style={[styles.contactIconContainer, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="call" size={28} color={colors.primary} />
              </View>
              <View style={styles.contactOptionText}>
                <Text style={styles.contactOptionTitle}>Phone Call</Text>
                <Text style={styles.contactOptionSubtitle}>{CONTACT_INFO.phone}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* Email */}
            <TouchableOpacity
              style={styles.contactOption}
              onPress={handleEmailPress}
              activeOpacity={0.7}
            >
              <View style={[styles.contactIconContainer, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="mail" size={28} color="#F57C00" />
              </View>
              <View style={styles.contactOptionText}>
                <Text style={styles.contactOptionTitle}>Email</Text>
                <Text style={styles.contactOptionSubtitle}>{CONTACT_INFO.email}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Address Section */}
          <View style={styles.addressSection}>
            <View style={styles.addressHeader}>
              <Ionicons name="location" size={20} color={colors.primary} />
              <Text style={styles.addressTitle}>Our Location</Text>
            </View>
            <Text style={styles.addressText}>{CONTACT_INFO.address}</Text>
            <TouchableOpacity
              style={styles.mapButton}
              onPress={openMaps}
              activeOpacity={0.8}
            >
              <Ionicons name="map" size={18} color={colors.white} />
              <Text style={styles.mapButtonText}>Open in Google Maps</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: spacing.radiusLg,
    borderTopRightRadius: spacing.radiusLg,
    paddingBottom: spacing.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalCloseButton: {
    padding: spacing.xs,
  },
  contactOptionsContainer: {
    padding: spacing.lg,
  },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: spacing.radiusMd,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  contactIconContainer: {
    width: 50,
    height: 50,
    borderRadius: spacing.radiusMd,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  contactOptionText: {
    flex: 1,
  },
  contactOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  contactOptionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  addressSection: {
    margin: spacing.lg,
    marginTop: 0,
    padding: spacing.lg,
    backgroundColor: '#F9FAFB',
    borderRadius: spacing.radiusMd,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: spacing.xs,
  },
  addressText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
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
});

export default ContactModal;
