/**
 * PackageSelector Component
 * Dropdown selector for packages with View Detail button
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import { getCategoryIcon } from '../../utils/categoryHelpers';

const PackageSelector = ({
  packages,
  selectedPackage,
  onSelectPress,
  onViewDetailPress,
}) => {
  const selectedPkg = packages.find((p) => p._id === selectedPackage);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Package</Text>

      {/* Package Dropdown */}
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={onSelectPress}
        activeOpacity={0.7}
      >
        <View style={styles.dropdownContent}>
          <Ionicons
            name={
              selectedPkg
                ? getCategoryIcon(selectedPkg.category)
                : 'cube-outline'
            }
            size={24}
            color={colors.primary}
          />
          <Text style={styles.dropdownText}>
            {selectedPkg
              ? selectedPkg.name.replace(' Booking', '').replace(' Package', '')
              : 'Select a package'}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      {/* View Package Detail Button */}
      <TouchableOpacity
        style={[
          styles.viewDetailButton,
          !selectedPackage && styles.viewDetailButtonDisabled,
        ]}
        onPress={onViewDetailPress}
        disabled={!selectedPackage}
        activeOpacity={0.8}
      >
        <Text style={styles.viewDetailButtonText}>View Package Details</Text>
        <Ionicons name="arrow-forward" size={18} color={colors.black} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  title: {
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
    backgroundColor: '#E0E0E0',
    opacity: 0.6,
  },
});

export default PackageSelector;
