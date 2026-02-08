/**
 * PackageSelectionModal Component
 * Modal for selecting packages from a list
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import { getCategoryIcon } from '../../utils/categoryHelpers';

const PackageSelectionModal = ({
  visible,
  onClose,
  packages,
  selectedPackage,
  onSelectPackage,
}) => {
  const handleSelect = (packageId) => {
    onSelectPackage(packageId);
    onClose();
  };

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
            <Text style={styles.modalTitle}>Select Package</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Package List */}
          <ScrollView style={styles.modalBody}>
            {packages.map((pkg) => (
              <TouchableOpacity
                key={pkg._id}
                style={[
                  styles.option,
                  selectedPackage === pkg._id && styles.optionSelected,
                ]}
                onPress={() => handleSelect(pkg._id)}
                activeOpacity={0.7}
              >
                <View style={styles.optionContent}>
                  <Ionicons
                    name={getCategoryIcon(pkg.category)}
                    size={24}
                    color={
                      selectedPackage === pkg._id
                        ? colors.primary
                        : colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.optionText,
                      selectedPackage === pkg._id && styles.optionTextSelected,
                    ]}
                  >
                    {pkg.name.replace(' Booking', '').replace(' Package', '')}
                  </Text>
                </View>
                {selectedPackage === pkg._id && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={colors.primary}
                  />
                )}
              </TouchableOpacity>
            ))}
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
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  optionSelected: {
    backgroundColor: '#F0F7FF',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionText: {
    fontSize: 15,
    color: colors.text,
    marginLeft: spacing.md,
    flex: 1,
  },
  optionTextSelected: {
    fontWeight: '600',
    color: colors.primary,
  },
});

export default PackageSelectionModal;
