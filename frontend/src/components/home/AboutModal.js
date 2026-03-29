/**
 * AboutModal Component
 * Modal displaying detailed description about the bhavan with image carousel
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import { ABOUT_CONTENT, CAROUSEL_IMAGES } from '../../constants/app';
import ImageCarousel from '../common/ImageCarousel';

const { width } = Dimensions.get('window');

const AboutModal = ({ visible, onClose }) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>About Mathur Vaishya Bhavan</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalBody}
            showsVerticalScrollIndicator={false}
          >
            {/* Image Carousel */}
            <View style={styles.carouselWrapper}>
              <ImageCarousel
                images={CAROUSEL_IMAGES}
                autoScroll={false}
                height={200}
                width={width - 32}
                showArrows={false}
                borderRadius={spacing.radiusMd}
              />
            </View>

            {/* Detailed Description */}
            <View style={styles.descriptionContent}>
              <Text style={styles.descriptionTitle}>
                {ABOUT_CONTENT.full.title}
              </Text>
              <Text style={styles.descriptionText}>
                {ABOUT_CONTENT.full.description}
                {'\n\n'}
                <Text style={styles.descriptionBold}>Our Highlights:</Text>
                {ABOUT_CONTENT.full.highlights.map((highlight, index) => (
                  <Text key={index}>
                    {'\n'}• {highlight}
                  </Text>
                ))}
                {'\n\n'}
                {ABOUT_CONTENT.full.closing}
              </Text>
            </View>
          </ScrollView>
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
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
  carouselWrapper: {
    marginBottom: spacing.lg,
  },
  descriptionContent: {
    paddingHorizontal: spacing.md,
  },
  descriptionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  descriptionText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  descriptionBold: {
    fontWeight: 'bold',
    color: colors.text,
  },
});

export default AboutModal;
