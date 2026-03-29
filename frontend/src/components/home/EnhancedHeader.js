/**
 * EnhancedHeader Component
 * Decorative header with patterns, logo, and quick info
 */

import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';

const EnhancedHeader = ({ paddingTop = 0 }) => {
  return (
    <View style={[styles.header, { paddingTop }]}>
      {/* Background Pattern Overlay */}
      <View style={styles.headerPattern}>
        <View style={styles.patternCircle1} />
        <View style={styles.patternCircle2} />
        <View style={styles.patternCircle3} />
      </View>

      {/* Header Content */}
      <View style={styles.headerContent}>
        {/* Logo */}
        <View style={styles.headerTopRow}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/SplashScreenLogo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Main Title Section */}
        <View style={styles.headerTitleSection}>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.bhavanText}>Mathur Vaishya Bhavan</Text>
          <View style={styles.titleUnderline} />
          <Text style={styles.taglineText}>Where Memories Are Made</Text>
        </View>

        {/* Location Quick Info */}
        <View style={styles.headerLocationRow}>
          <View style={styles.locationBadge}>
            <Ionicons name="location-sharp" size={14} color={colors.white} />
            <Text style={styles.locationBadgeText}>Hyderabad</Text>
          </View>
          <View style={styles.locationBadge}>
            <Ionicons name="time" size={14} color={colors.white} />
            <Text style={styles.locationBadgeText}>Open Daily</Text>
          </View>
          <View style={styles.locationBadge}>
            <Ionicons name="call" size={14} color={colors.white} />
            <Text style={styles.locationBadgeText}>24/7 Support</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    position: 'relative',
    overflow: 'hidden',
  },
  headerPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  patternCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.white,
    top: -50,
    right: -50,
  },
  patternCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.white,
    bottom: -30,
    left: -30,
  },
  patternCircle3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.accent,
    top: 100,
    left: 50,
  },
  headerContent: {
    position: 'relative',
    zIndex: 1,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
  },
  logoImage: {
    width: '88%',
    height: '88%',
  },
  headerTitleSection: {
    marginBottom: spacing.md,
  },
  welcomeText: {
    fontSize: 16,
    color: colors.accent,
    fontWeight: '500',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  bhavanText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  titleUnderline: {
    width: 60,
    height: 3,
    backgroundColor: colors.accent,
    borderRadius: 2,
    marginBottom: spacing.sm,
  },
  taglineText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    fontStyle: 'italic',
    letterSpacing: 0.3,
  },
  headerLocationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs - 2,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 2,
    justifyContent: 'center',
  },
  locationBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 4,
  },
});

export default EnhancedHeader;
