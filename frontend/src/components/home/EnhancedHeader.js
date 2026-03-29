/**
 * EnhancedHeader — compact top bar (logo + title + quick facts)
 */

import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';

const EnhancedHeader = ({ paddingTop = 0 }) => {
  return (
    <View style={[styles.header, { paddingTop }]}>
      <View style={styles.headerPattern}>
        <View style={styles.patternCircle1} />
        <View style={styles.patternCircle2} />
      </View>

      <View style={styles.headerContent}>
        {/* Logo + title in one row */}
        <View style={styles.topRow}>
          <View style={styles.logoWrap}>
            <Image
              source={require('../../../assets/SplashScreenLogo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <View style={styles.titleColumn}>
            <Text style={styles.welcomeText}>Welcome to</Text>
            <Text style={styles.bhavanText} numberOfLines={2}>
              Mathur Vaishya Bhavan
            </Text>
            <Text style={styles.taglineText} numberOfLines={1}>
              Where memories are made
            </Text>
          </View>
        </View>

        {/* Compact chips */}
        <View style={styles.chipsRow}>
          <View style={styles.chip}>
            <Ionicons name="location-sharp" size={11} color={colors.white} />
            <Text style={styles.chipText} numberOfLines={1}>
              Hyderabad
            </Text>
          </View>
          <View style={styles.chip}>
            <Ionicons name="time" size={11} color={colors.white} />
            <Text style={styles.chipText} numberOfLines={1}>
              Open daily
            </Text>
          </View>
          <View style={styles.chip}>
            <Ionicons name="call" size={11} color={colors.white} />
            <Text style={styles.chipText} numberOfLines={1}>
              24/7
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    position: 'relative',
    overflow: 'hidden',
  },
  headerPattern: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.08,
  },
  patternCircle1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.white,
    top: -40,
    right: -20,
  },
  patternCircle2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent,
    bottom: -24,
    left: -16,
  },
  headerContent: {
    position: 'relative',
    zIndex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  logoWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    overflow: 'hidden',
    marginRight: spacing.sm,
  },
  logoImage: {
    width: '86%',
    height: '86%',
  },
  titleColumn: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
  welcomeText: {
    fontSize: 10,
    color: colors.accent,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  bhavanText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.white,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  taglineText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.75)',
    fontStyle: 'italic',
    marginTop: 2,
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 8,
    minWidth: 0,
  },
  chipText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '500',
    marginLeft: 3,
    flexShrink: 1,
  },
});

export default EnhancedHeader;
