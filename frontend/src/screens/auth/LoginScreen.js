import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import * as storage from '../../utils/storage';
import authService from '../../services/api/auth';

const LoginScreen = ({navigation, onLoginSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Validate inputs
  const validateInputs = () => {
    const newErrors = {};

    // Phone number validation (Indian format: 10 digits)
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(phoneNumber.trim())) {
      newErrors.phoneNumber = 'Enter a valid 10-digit phone number';
    }

    // Password validation
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle login
  const handleLogin = async () => {
    if (!validateInputs()) {
      return;
    }

    setLoading(true);
    setErrors({}); // Clear any previous errors

    try {
      console.log('🔐 Attempting login with:', phoneNumber);

      // Call real backend API
      const response = await authService.login(phoneNumber, password);

      console.log('✅ Login successful!');
      console.log('Token:', response.token);
      console.log('User:', response.user);

      // Save token to AsyncStorage
      await storage.saveToken(response.token);
      await storage.saveUser(response.user);

      // Show success message
      Alert.alert(
        'Login Successful!',
        `Welcome ${response.user.fullName}!`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Trigger navigation to home
              if (onLoginSuccess) {
                onLoginSuccess();
              }
            }
          }
        ]
      );

    } catch (error) {
      console.error('❌ Login failed:', error.message);

      // Show user-friendly error message
      setErrors({
        general: error.message || 'Login failed. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // DUMMY: Handle forgot password click
  const handleForgotPassword = () => {
    console.log('=== FORGOT PASSWORD CLICKED ===');
    Alert.alert(
      'Forgot Password',
      'Forgot password flow will be implemented here.',
      [{ text: 'OK' }]
    );
  };

  // Navigate to Register screen
  const handleSignUp = () => {
    navigation.navigate('Register');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar backgroundColor={colors.white} barStyle="dark-content" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Phone Number Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={[styles.input, errors.phoneNumber && styles.inputError]}
              placeholder="Enter your phone number"
              placeholderTextColor={colors.textSecondary}
              value={phoneNumber}
              onChangeText={(text) => {
                setPhoneNumber(text);
                if (errors.phoneNumber) {
                  setErrors({ ...errors, phoneNumber: null });
                }
              }}
              keyboardType="phone-pad"
              maxLength={10}
              autoComplete="tel"
              editable={!loading}
            />
            {errors.phoneNumber && (
              <Text style={styles.errorText}>{errors.phoneNumber}</Text>
            )}
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="Enter your password"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) {
                  setErrors({ ...errors, password: null });
                }
              }}
              secureTextEntry
              autoComplete="password"
              editable={!loading}
            />
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
          </View>

          {/* Forgot Password Link */}
          <TouchableOpacity
            style={styles.forgotPasswordContainer}
            onPress={handleForgotPassword}
            disabled={loading}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don't have an account? </Text>
            <TouchableOpacity
              onPress={handleSignUp}
              disabled={loading}
            >
              <Text style={styles.signUpLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingTop: spacing.xxl * 2,
    paddingBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: spacing.fontLg,
    color: colors.textSecondary,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: spacing.fontMd,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radiusMd,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: spacing.fontMd,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: spacing.fontSm,
    color: colors.error,
    marginTop: spacing.xs,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: spacing.xl,
  },
  forgotPasswordText: {
    fontSize: spacing.fontMd,
    color: colors.primary,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#0D34B7',
    paddingVertical: spacing.md + 4,
    borderRadius: spacing.radiusMd,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: spacing.lg,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: colors.white,
    fontSize: spacing.fontLg,
    fontWeight: '600',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: spacing.fontMd,
    color: colors.textSecondary,
  },
  signUpLink: {
    fontSize: spacing.fontMd,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default LoginScreen;