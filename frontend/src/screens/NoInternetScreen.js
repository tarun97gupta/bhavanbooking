import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../styles/colors';
import spacing from '../styles/spacing';
import { checkInternetConnection } from '../utils/networkCheck';

const NoInternetScreen = ({ onRetry }) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const insets = useSafeAreaInsets();

  const handleRetry = async () => {
    setIsRetrying(true);
    
    // Add a small delay to show the loading state
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const connectionStatus = await checkInternetConnection();
    
    setIsRetrying(false);
    
    if (connectionStatus.isConnected && connectionStatus.isInternetReachable !== false) {
      // Connection restored
      if (onRetry) {
        onRetry(true);
      }
    } else {
      // Still no connection
      if (onRetry) {
        onRetry(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      
      <View style={[styles.content, { paddingTop: insets.top + spacing.xl }]}>
        {/* Icon/Image */}
        <View style={styles.iconContainer}>
          <Ionicons name="cloud-offline" size={100} color={colors.textSecondary} />
        </View>

        {/* Title */}
        <Text style={styles.title}>No Internet Connection</Text>

        {/* Description */}
        <Text style={styles.description}>
          Oops! It seems you're not connected to the internet.
          Please check your connection and try again.
        </Text>

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle-outline" size={20} color={colors.primary} />
            <Text style={styles.tipText}>Check your WiFi or mobile data</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle-outline" size={20} color={colors.primary} />
            <Text style={styles.tipText}>Turn off airplane mode</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle-outline" size={20} color={colors.primary} />
            <Text style={styles.tipText}>Check your router connection</Text>
          </View>
        </View>

        {/* Retry Button */}
        <TouchableOpacity
          style={[styles.retryButton, isRetrying && styles.retryButtonDisabled]}
          onPress={handleRetry}
          disabled={isRetrying}
          activeOpacity={0.8}
        >
          {isRetrying ? (
            <>
              <ActivityIndicator size="small" color={colors.white} style={{ marginRight: spacing.sm }} />
              <Text style={styles.retryButtonText}>Checking...</Text>
            </>
          ) : (
            <>
              <Ionicons name="refresh" size={20} color={colors.white} style={{ marginRight: spacing.sm }} />
              <Text style={styles.retryButtonText}>Retry</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  tipsContainer: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  tipText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: spacing.sm,
    flex: 1,
  },
  retryButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl * 2,
    paddingVertical: spacing.md + 4,
    borderRadius: spacing.radiusMd,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  retryButtonDisabled: {
    opacity: 0.7,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NoInternetScreen;