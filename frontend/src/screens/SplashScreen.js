import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import colors from '../styles/colors';
import spacing from '../styles/spacing';
import { APP_CONFIG } from '../constants/app';

const SplashScreen = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, APP_CONFIG.splashScreenDuration);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      {/* Top Blue Half */}
      <View style={styles.topHalf}>
        {/* Logo positioned at the center where blue and white meet */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/SplashScreenLogo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Bottom White Half */}
      <View style={styles.bottomHalf}>
        {/* Welcome text at bottom */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>Welcome to Mathur Vaishya Bhavan</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHalf: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bottomHalf: {
    flex: 1,
    backgroundColor: colors.white,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: spacing.xl * 2,
  },
  logoContainer: {
    position: 'absolute',
    bottom: -80, // Half of logo height to position it at the center
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  logo: {
    width: 160,
    height: 160,
  },
  welcomeContainer: {
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
    letterSpacing: 0.5,
  },
});

export default SplashScreen;

