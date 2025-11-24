import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';

const ProfileScreen = ({ onLogout }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Profile</Text>
      <Text style={styles.subtitle}>Profile settings and information</Text>
      
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={onLogout}
      >
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPaddingHorizontal,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: spacing.fontMd,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  logoutButton: {
    backgroundColor: colors.error,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: spacing.radiusMd,
    marginTop: spacing.lg,
  },
  logoutButtonText: {
    color: colors.white,
    fontSize: spacing.fontMd,
    fontWeight: '600',
  },
});

export default ProfileScreen;