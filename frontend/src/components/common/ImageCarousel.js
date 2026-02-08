/**
 * ImageCarousel Component
 * Auto-scrolling image carousel with manual navigation
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';

const { width: screenWidth } = Dimensions.get('window');

const ImageCarousel = ({
  images,
  autoScroll = true,
  autoScrollInterval = 3000,
  height = 250,
  width = screenWidth,
  showArrows = true,
  showPagination = true,
  borderRadius = 0,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);

  // Auto-scroll effect
  useEffect(() => {
    if (!autoScroll || images.length <= 1) return;

    const interval = setInterval(() => {
      if (carouselRef.current) {
        const nextIndex = (currentIndex + 1) % images.length;
        setCurrentIndex(nextIndex);
        carouselRef.current.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
      }
    }, autoScrollInterval);

    return () => clearInterval(interval);
  }, [currentIndex, autoScroll, autoScrollInterval, images.length]);

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setCurrentIndex(index);
  };

  const scrollToIndex = (index) => {
    if (carouselRef.current) {
      carouselRef.current.scrollToIndex({
        index,
        animated: true,
      });
      setCurrentIndex(index);
    }
  };

  const handlePrevious = () => {
    const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    scrollToIndex(prevIndex);
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % images.length;
    scrollToIndex(nextIndex);
  };

  return (
    <View style={[styles.container, { height }]}>
      <FlatList
        ref={carouselRef}
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item.uri }}
            style={[styles.image, { width, height, borderRadius }]}
            resizeMode="cover"
          />
        )}
      />

      {/* Arrow Buttons */}
      {showArrows && images.length > 1 && (
        <>
          <TouchableOpacity
            style={[styles.arrowButton, styles.leftArrow]}
            onPress={handlePrevious}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color={colors.white} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.arrowButton, styles.rightArrow]}
            onPress={handleNext}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-forward" size={24} color={colors.white} />
          </TouchableOpacity>
        </>
      )}

      {/* Pagination Dots */}
      {showPagination && images.length > 1 && (
        <View style={styles.paginationContainer}>
          {images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentIndex && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    width: screenWidth,
  },
  arrowButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -20 }],
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  leftArrow: {
    left: spacing.md,
  },
  rightArrow: {
    right: spacing.md,
  },
  paginationContainer: {
    position: 'absolute',
    bottom: spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: colors.white,
    width: 24,
  },
});

export default ImageCarousel;
