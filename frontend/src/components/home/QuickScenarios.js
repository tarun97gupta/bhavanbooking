/**
 * QuickScenarios Component
 * Grid of quick scenario cards for common booking types
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import { QUICK_SCENARIOS } from '../../constants/app';

const { width } = Dimensions.get('window');

const QuickScenarios = ({ onScenarioPress }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Scenarios</Text>
      <View style={styles.grid}>
        {QUICK_SCENARIOS.map((scenario) => (
          <TouchableOpacity
            key={scenario.id}
            style={[styles.card, { backgroundColor: scenario.color }]}
            onPress={() => onScenarioPress(scenario)}
            activeOpacity={0.8}
          >
            <Ionicons name={scenario.icon} size={32} color={colors.white} />
            <Text style={styles.cardTitle}>{scenario.title}</Text>
          </TouchableOpacity>
        ))}
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  card: {
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});

export default QuickScenarios;
