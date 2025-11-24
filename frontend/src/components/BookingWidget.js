import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import colors from '../styles/colors';
import spacing from '../styles/spacing';

const { width } = Dimensions.get('window');

// Booking categories for the hotel/bhavan
const BOOKING_CATEGORIES = [
  { id: '1', name: 'Full Bhavan Booking', icon: '🏢' },
  { id: '2', name: 'Function Hall + Dining', icon: '🍽️' },
  { id: '3', name: 'Function Hall Only', icon: '🎪' },
  { id: '4', name: 'Rooms + Dining', icon: '🛏️' },
  { id: '5', name: 'Rooms Only', icon: '🏨' },
  { id: '6', name: 'Mini Hall (Meeting Room)', icon: '🏛️' },
];

const BookingWidget = ({ onCheckAvailability }) => {
  // State management
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [numberOfNights, setNumberOfNights] = useState(0);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [markedDates, setMarkedDates] = useState({});

  // Calculate number of nights when dates change
  useEffect(() => {
    if (checkInDate && checkOutDate) {
      const nights = dayjs(checkOutDate).diff(dayjs(checkInDate), 'day');
      setNumberOfNights(nights);
    }
  }, [checkInDate, checkOutDate]);

  // Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setShowCategoryDropdown(false);
  };

  // Handle date selection in calendar
  const handleDayPress = (day) => {
    const selectedDate = day.dateString;

    if (!checkInDate || (checkInDate && checkOutDate)) {
      // First selection or reset selection
      setCheckInDate(selectedDate);
      setCheckOutDate(null);
      setMarkedDates({
        [selectedDate]: {
          startingDay: true,
          color: colors.primary,
          textColor: colors.white,
        },
      });
    } else if (checkInDate && !checkOutDate) {
      // Second selection
      if (dayjs(selectedDate).isBefore(dayjs(checkInDate))) {
        // If selected date is before check-in, reset
        setCheckInDate(selectedDate);
        setCheckOutDate(null);
        setMarkedDates({
          [selectedDate]: {
            startingDay: true,
            color: colors.primary,
            textColor: colors.white,
          },
        });
      } else {
        // Valid check-out date
        setCheckOutDate(selectedDate);
        // Mark range
        const range = getDateRange(checkInDate, selectedDate);
        setMarkedDates(range);
      }
    }
  };

  // Get date range for marking calendar
  const getDateRange = (start, end) => {
    const range = {};
    let currentDate = dayjs(start);
    const endDate = dayjs(end);

    while (currentDate.isBefore(endDate) || currentDate.isSame(endDate)) {
      const dateString = currentDate.format('YYYY-MM-DD');
      
      if (dateString === start) {
        range[dateString] = {
          startingDay: true,
          color: colors.primary,
          textColor: colors.white,
        };
      } else if (dateString === end) {
        range[dateString] = {
          endingDay: true,
          color: colors.primary,
          textColor: colors.white,
        };
      } else {
        range[dateString] = {
          color: colors.primaryLight || '#E8EEFB',
          textColor: colors.text,
        };
      }
      
      currentDate = currentDate.add(1, 'day');
    }

    return range;
  };

  // Confirm date selection
  const handleConfirmDates = () => {
    if (checkInDate && checkOutDate) {
      setShowDateModal(false);
    } else {
      Alert.alert('Incomplete Selection', 'Please select both check-in and check-out dates');
    }
  };

  // Handle check availability button press
  const handleCheckAvailability = () => {
    // Validate category
    if (!selectedCategory) {
      Alert.alert('Missing Information', 'Please select a booking category');
      return;
    }

    // Validate dates
    if (!checkInDate || !checkOutDate) {
      Alert.alert('Missing Information', 'Please select check-in and check-out dates');
      return;
    }

    // Pass data to parent component
    if (onCheckAvailability) {
      onCheckAvailability({
        category: selectedCategory,
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        numberOfNights: numberOfNights,
      });
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    return dayjs(dateString).format('ddd, MMM D');
  };

  // Get minimum date (today)
  const minDate = dayjs().format('YYYY-MM-DD');

  return (
    <View style={styles.container}>
      {/* Category Selector */}
      <View>
        <TouchableOpacity
          style={styles.sectionButton}
          onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
          activeOpacity={0.7}
        >
          <View style={styles.sectionContent}>
            <Ionicons name="list" size={20} color={colors.textSecondary} style={styles.sectionIcon} />
            <Text style={styles.sectionText}>
              {selectedCategory ? selectedCategory.name : 'Select Categories'}
            </Text>
          </View>
          <Ionicons 
            name={showCategoryDropdown ? "chevron-up" : "chevron-down"} 
            size={20} 
            color={colors.textSecondary} 
          />
        </TouchableOpacity>

        {/* Inline Dropdown List */}
        {showCategoryDropdown && (
          <View style={styles.dropdownList}>
            {BOOKING_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.dropdownItem,
                  selectedCategory?.id === category.id && styles.dropdownItemSelected,
                ]}
                onPress={() => handleCategorySelect(category)}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name="home-outline" 
                  size={18} 
                  color={selectedCategory?.id === category.id ? colors.primary : colors.textSecondary} 
                  style={styles.dropdownIcon}
                />
                <Text style={[
                  styles.dropdownItemText,
                  selectedCategory?.id === category.id && styles.dropdownItemTextSelected,
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Date Selector */}
      <TouchableOpacity
        style={styles.sectionButton}
        onPress={() => setShowDateModal(true)}
        activeOpacity={0.7}
      >
        <View style={styles.sectionContent}>
          <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} style={styles.sectionIcon} />
          <Text style={styles.sectionText}>
            {checkInDate && checkOutDate
              ? `${formatDate(checkInDate)} - ${formatDate(checkOutDate)}`
              : 'Select Dates'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Check Availability Button */}
      <TouchableOpacity
        style={styles.checkButton}
        onPress={handleCheckAvailability}
        activeOpacity={0.8}
      >
        <Text style={styles.checkButtonText}>Check Availability</Text>
      </TouchableOpacity>

      {/* Date Selection Modal */}
      <Modal
        visible={showDateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Dates</Text>
              <TouchableOpacity
                onPress={() => setShowDateModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Calendar */}
            <Calendar
              minDate={minDate}
              onDayPress={handleDayPress}
              markingType="period"
              markedDates={markedDates}
              theme={{
                todayTextColor: colors.primary,
                selectedDayBackgroundColor: colors.primary,
                selectedDayTextColor: colors.white,
                arrowColor: colors.primary,
                monthTextColor: colors.text,
                textMonthFontWeight: 'bold',
                textDayFontSize: 14,
                textMonthFontSize: 16,
              }}
            />

            {/* Confirm Button */}
            <TouchableOpacity
              style={[
                styles.confirmButton,
                (!checkInDate || !checkOutDate) && styles.confirmButtonDisabled,
              ]}
              onPress={handleConfirmDates}
              disabled={!checkInDate || !checkOutDate}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmButtonText}>Confirm Dates</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginHorizontal: spacing.screenPaddingHorizontal,
    overflow: 'hidden',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    // Shadow for Android
    elevation: 6,
  },

  // Section Button (Category & Date)
  sectionButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionIcon: {
    marginRight: spacing.sm,
  },
  sectionText: {
    fontSize: 15,
    color: colors.text,
    flex: 1,
  },

  // Inline Dropdown
  dropdownList: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemSelected: {
    backgroundColor: '#F8F9FA',
  },
  dropdownIcon: {
    marginRight: spacing.sm,
  },
  dropdownItemText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  dropdownItemTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: '#E8E8E8',
  },

  // Check Availability Button
  checkButton: {
    backgroundColor: '#FDB813',
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
    justifyContent: 'center',
    margin: spacing.md,
    borderRadius: spacing.radiusMd,
  },
  checkButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Modal Overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '75%',
    paddingBottom: spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },

  // Confirm Button
  confirmButton: {
    backgroundColor: colors.primary,
    margin: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: spacing.radiusMd,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: colors.textSecondary,
    opacity: 0.5,
  },
  confirmButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BookingWidget;

