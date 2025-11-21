import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar, Image, Text } from 'react-native';
import colors from '../../styles/colors';

const SplashScreen = ({ onFinish }) => {
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onFinish) {
        onFinish();
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.splashBlue} barStyle="light-content" />
      
      {/* Top Half - Blue */}
      <View style={styles.topHalf} />
      
      {/* Bottom Half - White */}
      <View style={styles.bottomHalf} />
      
      {/* Logo - Centered at junction */}
      <View style={styles.logoWrapper}>
        <Image 
          source={require('../../../assets/SplashScreenLogo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Welcome Text - Bottom of screen */}
      <View style={styles.textWrapper}>
        <Text style={styles.welcomeText}>Welcome to</Text>
        <Text style={styles.hotelName}>Mathur Vaishya Bhavan</Text>
        <Text style={styles.location}>Hyderabad</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    topHalf: {
      flex: 0.5,
      backgroundColor: colors.splashBlue,
    },
    bottomHalf: {
      flex: 0.5,
      backgroundColor: colors.white,
    },
    logoWrapper: {
      position: 'absolute',
      top: '50%',
      left: 0,
      right: 0,
      alignItems: 'center',
      transform: [{ translateY: -125 }],
    },
    logo: {
      width: 250,
      height: 250,
    },
    textWrapper: {
      position: 'absolute',
      bottom: 60,              // Distance from bottom
      left: 0,
      right: 0,
      alignItems: 'center',
    },
    welcomeText: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    hotelName: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    location: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colors.text,
    },
  });

export default SplashScreen;