import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  Image,  // ← Added Image import
} from 'react-native';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';

const WelcomeScreen = ({ onGetStarted }) => {
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />
      
      {/* Background Image - Full Screen */}
      <ImageBackground
        source={require('../../../assets/MainEntrance.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Logo - Top Left */}
        <Image 
          source={require('../../../assets/SplashScreenLogo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Bottom Container with Opacity */}
        <View style={styles.bottomContainer}>
          {/* Semi-transparent overlay */}
          <View style={styles.overlay} />
          
          {/* Content */}
          <View style={styles.content}>
            {/* Text Content - Top */}
            <View style={styles.textContainer}>
              <Text style={styles.tagline}>A community that cares</Text>
              <Text style={styles.description}>
                Our society is built to offer you a refined, worry-free living experience from day one.
              </Text>
            </View>

            {/* Button - Bottom */}
            <TouchableOpacity
              style={styles.button}
              activeOpacity={0.8}
              onPress={onGetStarted}
            >
              <Text style={styles.buttonText} numberOfLines={1}>
                Get Started
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  logo: {
    position: 'absolute',
    top: 50,              // 50px from top (accounts for StatusBar)
    left: 20,             // 20px from left
    width: 80,            // 64px width
    height: 80,           // 64px height
    zIndex: 10,           // Ensures logo is above other elements
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.white,
    opacity: 0.6,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  textContainer: {
    alignItems: 'center',
  },
  tagline: {
    fontSize: spacing.font2xl,
    fontWeight: 'bold',
    color: colors.black,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    fontSize: spacing.fontMd,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.xs,
  },
  button: {
    backgroundColor: '#0D34B7',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: spacing.radiusMd,
    minWidth: '95%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: colors.white,
    fontSize: spacing.fontLg,
    fontWeight: '600',
  },
});

export default WelcomeScreen;