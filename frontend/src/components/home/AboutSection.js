/**
 * AboutSection Component
 * Displays short description about the bhavan with Read More button
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import { ABOUT_CONTENT } from '../../constants/app';

const AboutSection = ({ onReadMore }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>About Mathur Vaishya Bhavan</Text>
      <Text style={styles.text}>{ABOUT_CONTENT.short}</Text>
      <TouchableOpacity
        style={styles.readMoreButton}
        onPress={onReadMore}
        activeOpacity={0.7}
      >
        <Text style={styles.readMoreText}>Read More</Text>
        <Ionicons name="arrow-forward" size={16} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    margin: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.lg,
    borderRadius: spacing.radiusMd,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  text: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginRight: spacing.xs,
  },
});

export default AboutSection;
